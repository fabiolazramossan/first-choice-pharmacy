import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
    if (!url || !key) return NextResponse.json({ error: "Configuración no disponible." }, { status: 503 });
    const origin = new URL(request.url).origin;
    const redirectTo = origin + "/admin/reset-password";
    const response = await fetch(url + "/auth/v1/recover?redirect_to=" + encodeURIComponent(redirectTo), {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
      cache: "no-store",
    });
    if (!response.ok) {
      const upstreamStatus = response.status;
      let reason = "unknown";
      try {
        const payload = await response.json() as { code?: string; error_code?: string };
        reason = String(payload.code || payload.error_code || "unknown").slice(0, 80);
      } catch { /* Do not expose upstream response contents. */ }
      console.error("Password recovery rejected", { upstreamStatus, reason });
      const message = upstreamStatus === 401
        ? "Supabase rechazó la autenticación de la aplicación (401). Revisa la clave configurada y su vigencia."
        : upstreamStatus === 429
          ? "Demasiados intentos. Espera antes de solicitar otro enlace."
          : "No se pudo enviar el enlace. Revisa la configuración de autenticación de Supabase.";
      return NextResponse.json({ error: message, upstreamStatus, reason }, { status: 502 });
    }
    return NextResponse.json({ message: "Si la cuenta existe, recibirás un enlace de recuperación." });
  } catch {
    return NextResponse.json({ error: "No se pudo solicitar el enlace." }, { status: 500 });
  }
}
