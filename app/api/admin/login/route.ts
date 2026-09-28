import { NextResponse } from "next/server";
import { adminSupabaseConfig, pickAdminRole, sessionCookies } from "@/lib/admin-auth";
import { createRateLimiter } from "@/lib/rate-limit";
import { exceedsBodyLimit, getClientIp, isTrustedBrowserRequest } from "@/lib/server-security";

// Failed attempts only. Per-email protects one account from password guessing;
// per-IP slows one client trying many accounts. Best-effort per instance.
const failuresByEmail = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });
const failuresByIp = createRateLimiter({ limit: 20, windowMs: 15 * 60 * 1000 });

const INVALID = "Credenciales inválidas o cuenta sin acceso administrativo.";

function config() {
  const config = adminSupabaseConfig();
  if (!config) throw new Error("Supabase configuration is missing.");
  return config;
}

function tooMany(seconds: number) {
  return NextResponse.json(
    { error: "Demasiados intentos. Espera unos minutos e intenta otra vez." },
    { status: 429, headers: { "Retry-After": String(Math.max(seconds, 1)) } }
  );
}

export async function POST(request: Request) {
  if (!isTrustedBrowserRequest(request)) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }
  if (exceedsBodyLimit(request, 4_000)) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }
  const ip = getClientIp(request);
  if (failuresByIp.isLimited(ip)) return tooMany(failuresByIp.retryAfter(ip));

  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string" || !email || !password || email.length > 160 || password.length > 200) {
      return NextResponse.json({ error: "Email y contraseña son requeridos." }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (failuresByEmail.isLimited(normalizedEmail)) return tooMany(failuresByEmail.retryAfter(normalizedEmail));

    const recordFailure = () => {
      failuresByEmail.hit(normalizedEmail);
      failuresByIp.hit(ip);
    };

    const { url, key } = config();
    const auth = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password }),
      cache: "no-store",
    });

    if (auth.status === 429) return tooMany(60);
    if (!auth.ok) {
      recordFailure();
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    const session = await auth.json();
    const roles = await fetch(`${url}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(session.user.id)}`, {
      headers: { apikey: key, Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    const rows = roles.ok ? await roles.json() : [];
    if (!pickAdminRole(rows)) {
      // Valid password but no admin role: revoke the session we just created
      // and answer exactly like a wrong password (no account oracle).
      await fetch(`${url}/auth/v1/logout`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      }).catch(() => undefined);
      recordFailure();
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    failuresByEmail.reset(normalizedEmail);
    const response = NextResponse.json({ success: true });
    for (const cookie of sessionCookies(session)) response.cookies.set(cookie);
    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo iniciar sesión." }, { status: 500 });
  }
}
