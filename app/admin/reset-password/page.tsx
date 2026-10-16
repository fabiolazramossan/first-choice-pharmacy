"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get("access_token");
    const type = hash.get("type");
    if (accessToken && type === "recovery") {
      setToken(accessToken);
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      setError("El enlace de recuperación no es válido o ha caducado. Solicita uno nuevo.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (password.length < 12) return setError("Utiliza al menos 12 caracteres.");
    if (password !== confirmation) return setError("Las contraseñas no coinciden.");
    setLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key) throw new Error("Configuración de recuperación no disponible.");
      const response = await fetch(url + "/auth/v1/user", {
        method: "PUT",
        headers: { apikey: key, Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error("No se pudo actualizar la contraseña. Solicita un enlace nuevo.");
      setToken("");
      setMessage("Contraseña actualizada. Ya puedes iniciar sesión.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
      <h1 className="text-2xl font-bold">Nueva contraseña</h1>
      <p className="mt-2 text-sm text-white/60">First Choice Pharmacy · Administración</p>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-500/10 p-3 text-red-200">{error}</p>}
      {message && <p role="status" className="mt-5 rounded-lg bg-emerald-500/10 p-3 text-emerald-200">{message}</p>}
      {token && <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">Contraseña nueva<input type="password" name="password" autoComplete="new-password" required minLength={12} className="mt-2 w-full rounded-xl bg-white/10 px-4 py-3" /></label>
        <label className="block text-sm">Confirmar contraseña<input type="password" name="confirmation" autoComplete="new-password" required minLength={12} className="mt-2 w-full rounded-xl bg-white/10 px-4 py-3" /></label>
        <button disabled={loading} className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Guardando..." : "Guardar contraseña"}</button>
      </form>}
      <Link href="/admin/login" className="mt-6 inline-block text-sm text-emerald-300 underline">Volver a iniciar sesión</Link>
    </div>
  </main>;
}
