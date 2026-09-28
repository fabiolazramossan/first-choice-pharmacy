import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isTrustedBrowserRequest } from "@/lib/server-security";

export const ADMIN_SESSION_COOKIE = "fc_admin_session";
export const ADMIN_REFRESH_COOKIE = "fc_admin_refresh";
// The refresh cookie is renewed on every refresh, so an admin stays signed in
// while active and is signed out after this much inactivity.
const REFRESH_MAX_AGE_SECONDS = 8 * 60 * 60;
export const ADMIN_ROLES = ["admin", "manager"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminContext = {
  url: string;
  key: string;
  token: string;
  userId: string;
  email: string;
  role: AdminRole;
};

// Admin routes intentionally read only environment configuration (no fallback
// project) so a misconfigured deployment fails closed.
export function adminSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

export function pickAdminRole(rows: unknown): AdminRole | null {
  if (!Array.isArray(rows)) return null;
  for (const row of rows) {
    const role = (row as { role?: unknown })?.role;
    if (ADMIN_ROLES.includes(role as AdminRole)) return role as AdminRole;
  }
  return null;
}

type SupabaseSession = { access_token?: unknown; refresh_token?: unknown; expires_in?: unknown };

const cookieBase = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
});

/** Cookie settings for a Supabase session; used by login and token refresh. */
export function sessionCookies(session: SupabaseSession) {
  const accessToken = typeof session.access_token === "string" ? session.access_token : "";
  const refreshToken = typeof session.refresh_token === "string" ? session.refresh_token : "";
  return [
    {
      name: ADMIN_SESSION_COOKIE,
      value: accessToken,
      ...cookieBase(),
      maxAge: Math.min(Number(session.expires_in) || 3600, 3600),
    },
    // Scoped to admin API routes only: the long-lived token is never sent to pages.
    { name: ADMIN_REFRESH_COOKIE, value: refreshToken, ...cookieBase(), path: "/api/admin", maxAge: REFRESH_MAX_AGE_SECONDS },
  ].filter((cookie) => cookie.value);
}

export function clearedSessionCookies() {
  return [
    { name: ADMIN_SESSION_COOKIE, value: "", ...cookieBase(), maxAge: 0 },
    { name: ADMIN_REFRESH_COOKIE, value: "", ...cookieBase(), path: "/api/admin", maxAge: 0 },
  ];
}

async function fetchUser(config: { url: string; key: string }, token: string) {
  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: { apikey: config.key, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = await response.json();
  return typeof user?.id === "string" ? (user as { id: string; email?: string }) : null;
}

async function refreshSession(config: { url: string; key: string }, refreshToken: string) {
  const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: config.key, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });
  return response.ok ? ((await response.json()) as SupabaseSession) : null;
}

/**
 * Resolves the signed-in admin. When the 1-hour access token has expired, it
 * is renewed transparently with the refresh token (route handlers only, since
 * it writes cookies). Role membership is re-checked on every request.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const jar = await cookies();
  const config = adminSupabaseConfig();
  if (!config) return null;

  let token = jar.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  let user = token ? await fetchUser(config, token) : null;

  if (!user) {
    const refreshToken = jar.get(ADMIN_REFRESH_COOKIE)?.value;
    if (!refreshToken) return null;
    const session = await refreshSession(config, refreshToken);
    const refreshedToken = typeof session?.access_token === "string" ? session.access_token : "";
    user = refreshedToken ? await fetchUser(config, refreshedToken) : null;
    if (!session || !user) {
      for (const cookie of clearedSessionCookies()) jar.set(cookie);
      return null;
    }
    token = refreshedToken;
    for (const cookie of sessionCookies(session)) jar.set(cookie);
  }

  const rolesResponse = await fetch(
    `${config.url}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(user.id)}`,
    { headers: { apikey: config.key, Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (!rolesResponse.ok) return null;
  const role = pickAdminRole(await rolesResponse.json());
  if (!role) return null;

  return { ...config, token, userId: user.id, email: String(user.email ?? ""), role };
}

/**
 * Returns the admin context, or a ready-to-return error response. State-changing
 * requests must also come from this site's own pages (CSRF defense in depth on
 * top of the SameSite=strict session cookie).
 */
export async function requireAdmin(
  request?: Request
): Promise<{ ctx: AdminContext; error?: never } | { ctx?: never; error: NextResponse }> {
  if (request && request.method !== "GET" && !isTrustedBrowserRequest(request)) {
    return { error: NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 }) };
  }
  const ctx = await getAdminContext();
  if (!ctx) return { error: NextResponse.json({ error: "No autorizado." }, { status: 401 }) };
  return { ctx };
}

export function adminHeaders(ctx: AdminContext, json = false): Record<string, string> {
  const headers: Record<string, string> = { apikey: ctx.key, Authorization: `Bearer ${ctx.token}` };
  if (json) {
    headers["Content-Type"] = "application/json";
    headers.Prefer = "return=representation";
  }
  return headers;
}
