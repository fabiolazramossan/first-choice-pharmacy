import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("fc_admin_session")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!token || !url || !key) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const userResponse = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!userResponse.ok) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await userResponse.json();
  const roleResponse = await fetch(
    `${url}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(user.id)}`,
    { headers: { apikey: key, Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  const roles = roleResponse.ok ? await roleResponse.json() : [];
  const role = roles.find((row: { role?: string }) => row.role === "admin" || row.role === "manager")?.role;

  if (!role) return NextResponse.json({ authenticated: false }, { status: 403 });
  return NextResponse.json({ authenticated: true, email: user.email, role });
}
