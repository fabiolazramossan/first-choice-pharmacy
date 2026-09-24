import { NextResponse } from "next/server";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) throw new Error("Supabase configuration is missing.");
  return { url, key };
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos." }, { status: 400 });
    }

    const { url, key } = config();
    const auth = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      cache: "no-store",
    });

    if (!auth.ok) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const session = await auth.json();
    const roles = await fetch(`${url}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(session.user.id)}`, {
      headers: { apikey: key, Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    const rows = roles.ok ? await roles.json() : [];
    const allowed = rows.some((row: { role?: string }) => row.role === "admin" || row.role === "manager");

    if (!allowed) {
      return NextResponse.json({ error: "Esta cuenta no tiene acceso administrativo." }, { status: 403 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("fc_admin_session", session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: Math.min(Number(session.expires_in) || 3600, 3600),
    });
    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo iniciar sesión." }, { status: 500 });
  }
}
