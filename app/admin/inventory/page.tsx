"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Product = { id: string; name: string; brand: string | null; sku: string | null; upc: string | null; is_active: boolean };
type Row = { product_id: string; quantity: number; low_stock_threshold: number; updated_at: string | null; products: Product };
type Stats = { total: number; units: number; low: number; out: number };
type Filters = { q: string; filter: string; page: number };

export default function InventoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, units: 0, low: 0, out: 0 });
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [filters, setFilters] = useState<Filters>({ q: "", filter: "all", page: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [qty, setQty] = useState("");
  const [threshold, setThreshold] = useState("");
  const [saving, setSaving] = useState(false);
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    const params = new URLSearchParams({ q: filters.q, filter: filters.filter, page: String(filters.page) });
    const r = await fetch(`/api/admin/inventory?${params}`, { cache: "no-store" });
    if (requestId !== latestRequest.current) return;
    if (r.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const d = await r.json();
    if (requestId !== latestRequest.current) return;
    if (!r.ok) setError(d.error || "Error cargando inventario.");
    else {
      setRows(d.inventory || []);
      setStats(d.stats);
      setTotal(d.total || 0);
      setPageCount(d.pageCount || 1);
      setError("");
    }
    setLoading(false);
  }, [filters, router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = window.setTimeout(() => setFilters((f) => (f.q === search ? f : { ...f, q: search, page: 1 })), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  function edit(r: Row) {
    setEditing(r.product_id);
    setQty(String(r.quantity));
    setThreshold(String(r.low_stock_threshold));
  }

  async function save(row: Row) {
    setSaving(true);
    setError("");
    const r = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: row.product_id,
        quantity: Number(qty),
        low_stock_threshold: Number(threshold),
        expected_quantity: row.quantity,
      }),
    });
    const d = await r.json();
    setSaving(false);
    if (!r.ok) {
      setError(d.error || "No se pudo guardar.");
      return;
    }
    setEditing(null);
    await load();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-400">FIRST CHOICE PHARMACY</p>
            <h1 className="text-xl font-bold">Inventario</h1>
          </div>
          <Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm">← Dashboard</Link>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <Card n={stats.total} t="Productos" />
          <Card n={stats.units} t="Unidades" />
          <Card n={stats.low} t="Stock bajo" />
          <Card n={stats.out} t="Agotados" />
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar inventario"
            placeholder="Buscar producto, marca, SKU o UPC…"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          />
          <select
            value={filters.filter}
            onChange={(e) => setFilters((f) => ({ ...f, filter: e.target.value, page: 1 }))}
            aria-label="Filtrar inventario"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
          >
            <option value="all">Todo</option>
            <option value="low">Stock bajo</option>
            <option value="out">Agotados</option>
            <option value="in">Con stock</option>
          </select>
        </div>
        <p className="mt-4 text-sm text-white/60" role="status">{loading ? "Cargando…" : `${total} productos`}</p>
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10" aria-busy={loading}>
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">SKU / UPC</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Alerta ≤</th>
                <th className="p-4">Estado</th>
                <th className="p-4"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center text-white/60">No hay productos con estos filtros.</td></tr>
              )}
              {rows.map((r) => {
                const p = r.products;
                const isEdit = editing === r.product_id;
                const status = r.quantity === 0 ? "Agotado" : r.quantity <= r.low_stock_threshold ? "Bajo" : "Disponible";
                return (
                  <tr key={r.product_id} className="border-t border-white/10">
                    <td className="p-4">
                      <p className="font-semibold">{p?.name || "Producto"}</p>
                      <p className="text-xs text-white/60">{p?.brand || "Sin marca"}</p>
                    </td>
                    <td className="p-4 text-white/70">{p?.sku || "—"}<br /><span className="text-xs">{p?.upc || ""}</span></td>
                    <td className="p-4">
                      {isEdit ? (
                        <input type="number" min="0" aria-label="Cantidad en stock" value={qty} onChange={(e) => setQty(e.target.value)} className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-2" />
                      ) : (
                        <b>{r.quantity}</b>
                      )}
                    </td>
                    <td className="p-4">
                      {isEdit ? (
                        <input type="number" min="0" aria-label="Alerta de stock bajo" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-2" />
                      ) : (
                        r.low_stock_threshold
                      )}
                    </td>
                    <td className="p-4">
                      <span className={"rounded-full px-2.5 py-1 text-xs " + (status === "Disponible" ? "bg-emerald-500/15 text-emerald-300" : status === "Bajo" ? "bg-amber-500/15 text-amber-300" : "bg-red-500/15 text-red-300")}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4">
                      {isEdit ? (
                        <div className="flex gap-2">
                          <button disabled={saving} onClick={() => save(r)} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950">{saving ? "…" : "Guardar"}</button>
                          <button onClick={() => setEditing(null)} className="rounded-lg border border-white/15 px-3 py-2 text-xs">Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => edit(r)} className="rounded-lg border border-emerald-400/30 px-3 py-2 text-xs font-semibold text-emerald-300">
                          Ajustar <span className="sr-only">{p?.name}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-3 text-sm">
            <button disabled={filters.page <= 1 || loading} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))} className="rounded-lg border border-white/15 px-4 py-2 disabled:opacity-30">← Anterior</button>
            <span className="text-white/70">Página {filters.page} de {pageCount}</span>
            <button disabled={filters.page >= pageCount || loading} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} className="rounded-lg border border-white/15 px-4 py-2 disabled:opacity-30">Siguiente →</button>
          </nav>
        )}
      </div>
    </main>
  );
}

function Card({ n, t }: { n: number; t: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-3xl font-bold">{n}</p>
      <p className="mt-1 text-sm text-white/60">{t}</p>
    </div>
  );
}
