import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminSupabaseConfig, clearedSessionCookies } from "@/lib/admin-auth";
import { isTrustedBrowserRequest } from "@/lib/server-security";

export async function POST(request: Request) {
  if (!isTrustedBrowserRequest(request)) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }

  // Revoke the Supabase session server-side so a copied refresh token stops
  // working, then clear both cookies.
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const config = adminSupabaseConfig();
  if (token && config) {
    await fetch(`${config.url}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: config.key, Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true });
  for (const cookie of clearedSessionCookies()) response.cookies.set(cookie);
  return response;
}
