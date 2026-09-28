import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isTrustedBrowserRequest } from "@/lib/server-security";

export const ADMIN_SESSION_COOKIE = "fc_admin_session";
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

export async function getAdminContext(): Promise<AdminContext | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const config = adminSupabaseConfig();
  if (!token || !config) return null;

  const headers = { apikey: config.key, Authorization: `Bearer ${token}` };
  const userResponse = await fetch(`${config.url}/auth/v1/user`, { headers, cache: "no-store" });
  if (!userResponse.ok) return null;
  const user = await userResponse.json();
  if (typeof user?.id !== "string") return null;

  const rolesResponse = await fetch(
    `${config.url}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(user.id)}`,
    { headers, cache: "no-store" }
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
