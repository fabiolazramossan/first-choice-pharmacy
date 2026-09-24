"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Admin = { email: string; role: string };

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    fetch("/api/admin/me", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return router.replace("/admin/login");
      const data = await response.json();
      setAdmin({ email: data.email, role: data.role });
    });
  }, [router]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (!admin) return <main className="min-h-screen bg-slate-950 p-8 text-white">Verificando acceso…</main>;

  const sections = [
    ["Productos", "Catálogo, precios y publicación"],
    ["Inventario", "Existencias y alertas de stock"],
    ["Órdenes", "Pedidos, pagos y fulfillment"],
    ["Categorías", "Organización del catálogo"],
    ["Usuarios", "Personal y permisos"],
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div><p className="text-sm font-semibold text-emerald-400">FIRST CHOICE PHARMACY</p><h1 className="text-xl font-bold">Admin Dashboard</h1></div>
          <button onClick={logout} className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10">Cerrar sesión</button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm text-white/60">Sesión: {admin.email} · {admin.role}</p>
        <h2 className="mt-3 text-3xl font-bold">Operaciones</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-white/60">{description}</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-emerald-400">Próximo módulo</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
