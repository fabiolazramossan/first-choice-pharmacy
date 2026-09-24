"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return setError(data.error || "No se pudo iniciar sesión.");
    router.replace("/admin");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">First Choice Pharmacy</p>
        <h1 className="mt-3 text-3xl font-bold">Administración</h1>
        <p className="mt-2 text-sm text-white/60">Acceso exclusivo para personal autorizado.</p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <label className="block text-sm">Email
            <input name="email" type="email" autoComplete="username" required className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-emerald-400" />
          </label>
          <label className="block text-sm">Contraseña
            <input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-emerald-400" />
          </label>
          {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">
            {loading ? "Verificando..." : "Entrar al panel"}
          </button>
        </form>
      </div>
    </main>
  );
}
