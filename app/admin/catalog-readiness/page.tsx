"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  upc: string | null;
  price: number | null;
  image_url: string | null;
  presentation_size: string | null;
  pan_eligibility_status: string | null;
  is_active: boolean;
  publication_status: string | null;
  inventory?: { quantity: number } | { quantity: number }[] | null;
};
type Response = { products?: Product[]; error?: string };
const ready = (p: Product) =>
  Boolean(p.sku?.trim() && p.presentation_size?.trim() && Number(p.price) > 0 &&
    p.image_url?.includes("/storage/v1/object/public/") &&
    ["eligible", "ineligible"].includes(p.pan_eligibility_status || ""));
const quantity = (p: Product) => {
  const inv = Array.isArray(p.inventory) ? p.inventory[0] : p.inventory;
  return inv?.quantity ?? null;
};
export default function CatalogReadiness() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");
  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/products", { cache: "no-store", credentials: "same-origin" })
      .then(async r => {
        if (r.status === 401) throw new Error("Sesión no autorizada. Inicia sesión en el administrador.");
        const data = (await r.json()) as Response;
        if (!r.ok) throw new Error(data.error || "No se pudo cargar el catálogo.");
        return data.products || [];
      })
      .then(data => { if (mounted) setItems(data); })
      .catch(e => { if (mounted) setError(e instanceof Error ? e.message : "Error de catálogo"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const pending = items.filter(p => !ready(p));
  const active = items.filter(p => p.is_active);
  const shown = useMemo(() => items.filter(p => filter === "all" || (filter === "ready" ? ready(p) : !ready(p))), [items, filter]);
  const fields = (p: Product) => [
    !p.sku?.trim() && "SKU",
    !p.presentation_size?.trim() && "Presentación",
    !(Number(p.price) > 0) && "Precio",
    !p.image_url?.includes("/storage/v1/object/public/") && "Imagen autorizada",
    !["eligible", "ineligible"].includes(p.pan_eligibility_status || "") && "Clasificación PAN",
    quantity(p) === null && "Inventario sin registro",
  ].filter(Boolean);
  return <main className="min-h-screen bg-slate-950 p-6 text-white">
    <div className="mx-auto max-w-6xl">
      <Link href="/admin" className="text-sm text-emerald-300">← Administrador</Link>
      <h1 className="mt-5 text-3xl font-bold">Preparación del catálogo</h1>
      <p className="mt-2 text-slate-300">Auditoría de solo lectura. No cambia precios, inventario ni publicación.</p>
      {loading && <p className="mt-8">Cargando productos…</p>}
      {error && <p role="alert" className="mt-8 rounded-xl border border-red-500 p-4 text-red-200">{error}</p>}
      {!loading && !error && <>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {([["Productos reales", items.length], ["Pendientes de completar", pending.length], ["Activos actualmente", active.length]] as const).map(([label, value]) =>
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-slate-300">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}
        </div>
        <p className="mt-4 text-sm text-amber-200">La revisión de preparación no garantiza disponibilidad, elegibilidad de venta ni autorización de publicación. Los borradores del catálogo preliminar no se incluyen en este conteo.</p>
        <div className="mt-7 flex flex-wrap gap-2">
          {([["pending", "Pendientes"], ["ready", "Campos completos"], ["all", "Todos"]] as const).map(([value, label]) =>
            <button key={value} onClick={() => setFilter(value)} className={`rounded-lg px-4 py-2 text-sm ${filter === value ? "bg-emerald-500 text-slate-950" : "bg-white/10"}`}>{label}</button>)}
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/10"><tr><th className="p-4">Producto</th><th className="p-4">Precio</th><th className="p-4">Existencias</th><th className="p-4">Campos por revisar</th><th className="p-4">Acción</th></tr></thead>
            <tbody>{shown.map(p => <tr key={p.id} className="border-t border-white/10">
              <td className="p-4 font-semibold">{p.name}</td><td className="p-4">{p.price == null ? "Pendiente" : `$${Number(p.price).toFixed(2)}`}</td>
              <td className="p-4">{quantity(p) ?? "Sin registro"}</td>
              <td className="p-4 text-amber-200">{fields(p).join(", ") || "Campos básicos completos"}</td>
              <td className="p-4"><Link className="text-emerald-300 underline" href="/admin/products">Revisar</Link></td>
            </tr>)}</tbody>
          </table>
          {!shown.length && <p className="p-6 text-slate-300">No hay productos en este filtro.</p>}
        </div>
      </>}
    </div>
  </main>;
}
