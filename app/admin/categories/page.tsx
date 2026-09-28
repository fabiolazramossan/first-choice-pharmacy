"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
};
type Form = { id?: string; name: string; slug: string; description: string; sort_order: string; is_active: boolean };

const input = "mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/categories", { cache: "no-store" });
    if (r.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const d = await r.json();
    if (!r.ok) setError(d.error || "Error cargando categorías.");
    else {
      setCategories(d.categories || []);
      setError("");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    const r = await fetch("/api/admin/categories", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) }),
    });
    const d = await r.json();
    setSaving(false);
    if (!r.ok) {
      setError(d.error || "No se pudo guardar.");
      return;
    }
    setForm(null);
    await load();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-400">FIRST CHOICE PHARMACY</p>
            <h1 className="text-xl font-bold">Categorías</h1>
          </div>
          <Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm">← Dashboard</Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-white/60">
            Las categorías inactivas y sus productos no aparecen en la tienda. Las categorías no se borran: se desactivan.
          </p>
          <button
            onClick={() => setForm({ name: "", slug: "", description: "", sort_order: String((categories.at(-1)?.sort_order ?? 0) + 10), is_active: false })}
            className="shrink-0 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950"
          >
            + Nueva categoría
          </button>
        </div>
        {error && <p role="alert" className="mt-6 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
        {loading ? (
          <p className="mt-8 text-white/60">Cargando categorías…</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="p-4">Orden</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">URL</th>
                  <th className="p-4">Productos</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-t border-white/10">
                    <td className="p-4 text-white/60">{c.sort_order}</td>
                    <td className="p-4">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-white/60">{c.description || "Sin descripción"}</p>
                    </td>
                    <td className="p-4 font-mono text-xs text-white/70">/productos/{c.slug}</td>
                    <td className="p-4">{c.product_count}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.is_active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/60"}`}>
                        {c.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setForm({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? "", sort_order: String(c.sort_order), is_active: c.is_active })}
                        className="rounded-lg border border-emerald-400/30 px-3 py-2 text-xs font-semibold text-emerald-300"
                      >
                        Editar <span className="sr-only">{c.name}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {form && (
        <div role="dialog" aria-modal="true" aria-label={form.id ? "Editar categoría" : "Nueva categoría"} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={submit} className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{form.id ? "Editar categoría" : "Nueva categoría"}</h2>
              <button type="button" onClick={() => setForm(null)} aria-label="Cerrar" className="text-white/60">✕</button>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="text-sm">Nombre *<input required minLength={2} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} /></label>
              {form.id ? (
                <p className="text-xs text-white/60">URL: /productos/{form.slug} (no se puede cambiar para no romper enlaces).</p>
              ) : (
                <label className="text-sm">
                  Identificador URL (opcional)
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Se genera del nombre" pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} className={input} />
                </label>
              )}
              <label className="text-sm">Descripción<input maxLength={200} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} /></label>
              <label className="text-sm">Orden<input type="number" min="0" max="10000" step="1" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className={input} /></label>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 p-4">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <span>Categoría activa (visible en la tienda)</span>
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setForm(null)} className="rounded-xl border border-white/15 px-4 py-3">Cancelar</button>
                <button disabled={saving} className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
