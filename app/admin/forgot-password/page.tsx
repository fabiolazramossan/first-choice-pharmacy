"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo enviar el correo.");
      setMessage(data.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al solicitar el enlace.");
    } finally {
      setLoading(false);
    }
  }
  return <main className="min-h-screen bg-slate-950 px-6 py-16 text-white"><div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
    <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
    <p className="mt-3 text-sm text-white/60">Recibirás un enlace para crear una contraseña nueva.</p>
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">Correo de tu cuenta<input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-xl bg-white/10 px-4 py-3" /></label>
      <button disabled={loading || Boolean(message)} className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">{loading ? "Enviando..." : "Enviar enlace"}</button>
    </form>
    {message && <p role="status" className="mt-4 text-emerald-200">{message}</p>}
    {error && <p role="alert" className="mt-4 text-red-200">{error}</p>}
    <Link href="/admin/login" className="mt-6 inline-block text-sm text-emerald-300 underline">Volver al inicio de sesión</Link>
  </div></main>;
}
