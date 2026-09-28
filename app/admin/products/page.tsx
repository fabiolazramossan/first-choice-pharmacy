"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Inventory = { quantity: number; low_stock_threshold: number };
type Product = {
  id: string;
  name: string;
  brand: string | null;
  sku: string | null;
  upc: string | null;
  price: number;
  image_url: string | null;
  presentation_size: string | null;
  pan_eligibility_status: string;
  is_active: boolean;
  is_featured: boolean;
  publication_status: string;
  category_id: string | null;
  inventory?: Inventory | Inventory[];
};
type Edit = {
  id: string;
  name: string;
  brand: string;
  sku: string;
  price: string;
  quantity: string;
  image_url: string;
  presentation_size: string;
  pan_eligibility_status: string;
  category_id: string;
  is_active: boolean;
};
type Category = { id: string; name: string; slug: string; is_active: boolean };
type NewProduct = { name: string; brand: string; sku: string; upc: string; category_id: string; price: string; quantity: string };
type Filters = { q: string; status: string; category: string; stock: string; page: number };

const input = "mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3";
const select = "rounded-xl border border-white/10 bg-slate-900 px-4 py-3";

function inventoryOf(p: Product) {
  return Array.isArray(p.inventory) ? p.inventory[0] : p.inventory;
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [filters, setFilters] = useState<Filters>({ q: "", status: "all", category: "", stock: "all", page: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState<Edit | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<NewProduct | null>(null);
  const [uploading, setUploading] = useState(false);
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    const params = new URLSearchParams({
      q: filters.q,
      status: filters.status,
      category: filters.category,
      stock: filters.stock,
      page: String(filters.page),
    });
    const r = await fetch(`/api/admin/products?${params}`, { cache: "no-store" });
    // Ignore responses from filters the admin has already changed.
    if (requestId !== latestRequest.current) return;
    if (r.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const d = await r.json();
    if (requestId !== latestRequest.current) return;
    if (!r.ok) setError(d.error || "Error cargando productos.");
    else {
      setProducts(d.products || []);
      setCategories(d.categories || []);
      setTotal(d.total || 0);
      setPageCount(d.pageCount || 1);
      setError("");
    }
    setLoading(false);
  }, [filters, router]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce typing so the server is queried once the admin pauses.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setFilters((f) => (f.q === search ? f : { ...f, q: search, page: 1 }));
    }, 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const setFilter = (key: "status" | "category" | "stock", value: string) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";

  function openEdit(p: Product) {
    setEdit({
      id: p.id,
      name: p.name,
      brand: p.brand || "",
      sku: p.sku || "",
      price: String(p.price),
      quantity: String(inventoryOf(p)?.quantity ?? 0),
      image_url: p.image_url || "",
      presentation_size: p.presentation_size || "",
      pan_eligibility_status: p.pan_eligibility_status || "unverified",
      category_id: p.category_id || "",
      is_active: p.is_active,
    });
  }

  async function create() {
    if (!draft) return;
    setCreating(true);
    setError("");
    const r = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, price: Number(draft.price), quantity: Number(draft.quantity) }),
    });
    const d = await r.json();
    setCreating(false);
    if (!r.ok) {
      setError(d.error || "No se pudo crear.");
      return;
    }
    setDraft(null);
    await load();
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    const f = new FormData();
    f.append("file", file);
    const r = await fetch("/api/admin/products/upload", { method: "POST", body: f });
    const d = await r.json();
    setUploading(false);
    if (!r.ok) {
      setError(d.error || "No se pudo subir la imagen.");
      return;
    }
    setEdit((e) => (e ? { ...e, image_url: d.url } : e));
  }

  async function save() {
    if (!edit) return;
    setSaving(true);
    setError("");
    const r = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...edit, price: Number(edit.price), quantity: Number(edit.quantity) }),
    });
    const d = await r.json();
    setSaving(false);
    if (!r.ok) {
      setError(d.error || "No se pudo guardar.");
      return;
    }
    setEdit(null);
    await load();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-400">FIRST CHOICE PHARMACY</p>
            <h1 className="text-xl font-bold">Productos</h1>
          </div>
          <Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm">← Dashboard</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Catálogo</h2>
            <p className="mt-1 text-sm text-white/60" role="status">
              {loading ? "Cargando…" : `${total} productos encontrados`}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/products/import" className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold">
              Importar CSV
            </Link>
            <button
              onClick={() =>
                setDraft({ name: "", brand: "", sku: "", upc: "", category_id: categories.find((c) => c.is_active)?.id || "", price: "", quantity: "0" })
              }
              className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950"
            >
              + Añadir
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar productos"
            placeholder="Buscar nombre, marca, SKU o UPC…"
            className="min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          />
          <select aria-label="Filtrar por estado" value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className={select}>
            <option value="all">Todos los estados</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
            <option value="inactive">Inactivos</option>
          </select>
          <select aria-label="Filtrar por categoría" value={filters.category} onChange={(e) => setFilter("category", e.target.value)} className={select}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select aria-label="Filtrar por inventario" value={filters.stock} onChange={(e) => setFilter("stock", e.target.value)} className={select}>
            <option value="all">Todo el inventario</option>
            <option value="in">Con stock</option>
            <option value="out">Agotados</option>
          </select>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10" aria-busy={loading}>
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">SKU / UPC</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Estado</th>
                <th className="p-4"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-white/50">No hay productos con estos filtros.</td>
                </tr>
              )}
              {products.map((p) => {
                const inv = inventoryOf(p);
                const published = p.is_active && p.publication_status === "published";
                return (
                  <tr key={p.id} className="border-t border-white/10">
                    <td className="p-4">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-white/50">{p.brand || "Sin marca"}</p>
                    </td>
                    <td className="p-4 text-white/70">{categoryName(p.category_id)}</td>
                    <td className="p-4 text-white/70">
                      {p.sku || "—"}
                      <br />
                      <span className="text-xs">{p.upc || ""}</span>
                    </td>
                    <td className="p-4 font-semibold">${Number(p.price).toFixed(2)}</td>
                    <td className="p-4">
                      {inv?.quantity ?? 0}
                      {inv && inv.quantity === 0 ? (
                        <span className="ml-2 rounded-full bg-red-500/15 px-2 py-1 text-xs text-red-300">Agotado</span>
                      ) : inv && inv.quantity <= inv.low_stock_threshold ? (
                        <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-300">Bajo</span>
                      ) : null}
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${published ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/60"}`}>
                        {published ? "Publicado" : p.is_active ? "Activo sin publicar" : "Borrador"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => openEdit(p)} className="rounded-lg border border-emerald-400/30 px-3 py-2 text-xs font-semibold text-emerald-300">
                        Editar <span className="sr-only">{p.name}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-3 text-sm">
            <button
              disabled={filters.page <= 1 || loading}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              className="rounded-lg border border-white/15 px-4 py-2 disabled:opacity-30"
            >
              ← Anterior
            </button>
            <span className="text-white/70">Página {filters.page} de {pageCount}</span>
            <button
              disabled={filters.page >= pageCount || loading}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              className="rounded-lg border border-white/15 px-4 py-2 disabled:opacity-30"
            >
              Siguiente →
            </button>
          </nav>
        )}
      </div>

      {edit && (
        <div role="dialog" aria-modal="true" aria-label="Editar producto" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Editar producto</h2>
              <button onClick={() => setEdit(null)} aria-label="Cerrar" className="text-white/60">✕</button>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="text-sm">Nombre<input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={input} /></label>
              <label className="text-sm">Marca<input value={edit.brand} onChange={(e) => setEdit({ ...edit, brand: e.target.value })} className={input} /></label>
              <label className="text-sm">
                Categoría
                <select value={edit.category_id} onChange={(e) => setEdit({ ...edit, category_id: e.target.value })} className={`${select} mt-2 w-full`}>
                  {!edit.category_id && <option value="">Sin categoría</option>}
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.is_active ? "" : " (inactiva)"}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">SKU *<input value={edit.sku} onChange={(e) => setEdit({ ...edit, sku: e.target.value })} className={input} /></label>
              <label className="text-sm">
                Presentación / tamaño *
                <input value={edit.presentation_size} onChange={(e) => setEdit({ ...edit, presentation_size: e.target.value })} placeholder="Ej. 12 oz, 24 tabletas" className={input} />
              </label>
              <label className="text-sm">
                Clasificación PAN *
                <select value={edit.pan_eligibility_status} onChange={(e) => setEdit({ ...edit, pan_eligibility_status: e.target.value })} className={`${select} mt-2 w-full`}>
                  <option value="unverified">Sin verificar</option>
                  <option value="eligible">Elegible</option>
                  <option value="ineligible">No elegible</option>
                </select>
              </label>
              <label className="text-sm">
                Imagen del producto *
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f);
                  }}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                />
                <span className="mt-2 block text-xs text-white/60">
                  {uploading
                    ? "Subiendo imagen…"
                    : edit.image_url
                      ? "Imagen cargada correctamente · puedes reemplazarla seleccionando otra."
                      : "JPG, PNG o WebP · máximo 1 MB"}
                </span>
                {edit.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element -- admin preview of a just-uploaded image
                  <img src={edit.image_url} alt="Vista previa de la imagen del producto" className="mt-3 h-28 w-28 rounded-xl bg-white object-contain p-2" />
                )}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm">Precio<input type="number" min="0" step="0.01" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} className={input} /></label>
                <label className="text-sm">Stock<input type="number" min="0" step="1" value={edit.quantity} onChange={(e) => setEdit({ ...edit, quantity: e.target.value })} className={input} /></label>
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 p-4">
                <input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} />
                <span>Producto activo / publicado</span>
              </label>
              <p className="text-xs text-white/60">Para publicar, Supabase exige SKU, presentación, precio mayor de $0, PAN clasificado e imagen alojada en Supabase Storage.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setEdit(null)} className="rounded-xl border border-white/15 px-4 py-3">Cancelar</button>
                <button onClick={save} disabled={saving} className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">
                  {saving ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {draft && (
        <div role="dialog" aria-modal="true" aria-label="Añadir producto" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Añadir producto</h2>
              <button onClick={() => setDraft(null)} aria-label="Cerrar" className="text-white/60">✕</button>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="text-sm">Nombre *<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={input} /></label>
              <label className="text-sm">Marca<input value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} className={input} /></label>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm">SKU<input value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} className={input} /></label>
                <label className="text-sm">UPC<input value={draft.upc} onChange={(e) => setDraft({ ...draft, upc: e.target.value })} className={input} /></label>
              </div>
              <label className="text-sm">
                Categoría *
                <select value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: e.target.value })} className={`${select} mt-2 w-full`}>
                  {categories.filter((c) => c.is_active).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm">Precio *<input type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className={input} /></label>
                <label className="text-sm">Stock *<input type="number" min="0" step="1" value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: e.target.value })} className={input} /></label>
              </div>
              <p className="rounded-xl border border-white/10 p-4 text-sm text-white/70">
                El producto se crea como borrador. Para publicarlo, ábrelo con “Editar” y completa imagen, SKU, presentación y clasificación PAN.
              </p>
              <p className="text-xs text-white/60">Los medicamentos con receta no se crean desde este formulario de e-commerce.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDraft(null)} className="rounded-xl border border-white/15 px-4 py-3">Cancelar</button>
                <button onClick={create} disabled={creating} className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">
                  {creating ? "Creando…" : "Crear producto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
