import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminSupabaseConfig, pickAdminRole } from "@/lib/admin-auth";
import { exceedsBodyLimit, isTrustedBrowserRequest } from "@/lib/server-security";

function config() {
  const config = adminSupabaseConfig();
  if (!config) throw new Error("Supabase configuration is missing.");
  return config;
}

export async function POST(request: Request) {
  if (!isTrustedBrowserRequest(request)) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }
  if (exceedsBodyLimit(request, 4_000)) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }
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
    if (!pickAdminRole(rows)) {
      return NextResponse.json({ error: "Esta cuenta no tiene acceso administrativo." }, { status: 403 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, session.access_token, {
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
