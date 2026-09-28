import Link from "next/link";
import AutoSubmit from "@/components/AutoSubmit";
import CatalogHeader from "@/components/CatalogHeader";
import ProductCard from "@/components/ProductCard";
import { categoryEmoji } from "@/lib/catalog-display";
import { CATALOG_PAGE_SIZE, type CatalogCategory, type CatalogProduct } from "@/lib/catalog";
import { CATALOG_SORTS, type CatalogSort } from "@/lib/search";

const WHATSAPP_BASE = "https://wa.me/17877516646?text=";

export type CatalogState = {
  search: string;
  sort: CatalogSort;
  inStockOnly: boolean;
  /** Only on /productos, where the category is a query parameter. */
  category?: string;
};

type Props = {
  title: string;
  description: string;
  emoji: string;
  basePath: string;
  state: CatalogState;
  result: { products: CatalogProduct[]; total: number; page: number; pageCount: number };
  categories?: CatalogCategory[];
  categorySlugById?: Record<string, string>;
  activeCategorySlug?: string;
};

/** Builds a catalog URL that keeps every active filter. */
export function catalogHref(basePath: string, state: CatalogState, page = 1, overrides: Partial<CatalogState> = {}) {
  const s = { ...state, ...overrides };
  const params = new URLSearchParams();
  if (s.search) params.set("q", s.search);
  if (s.category) params.set("categoria", s.category);
  if (s.sort !== "nombre") params.set("orden", s.sort);
  if (s.inStockOnly) params.set("disponibles", "1");
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Page numbers to show: first, last, and a window around the current page. */
function pageWindow(page: number, pageCount: number): (number | "…")[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

const chip = (active: boolean) =>
  `block whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-semibold ${
    active ? "border-green-600 bg-green-600 text-white" : "border-gray-300 text-gray-700 hover:border-green-600"
  }`;

export default function CatalogListing({
  title,
  description,
  emoji,
  basePath,
  state,
  result,
  categories,
  categorySlugById,
  activeCategorySlug,
}: Props) {
  const { products, total, page, pageCount } = result;
  const { search } = state;
  const whatsappHref = WHATSAPP_BASE + encodeURIComponent(`Hola, quisiera información sobre ${title}`);
  const firstItem = total === 0 ? 0 : (page - 1) * CATALOG_PAGE_SIZE + 1;
  const lastItem = Math.min(total, firstItem + products.length - 1);
  const filtered = Boolean(search || state.inStockOnly);

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader />

      <main id="contenido" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {!categories && (
          <nav aria-label="Ruta de navegación" className="mb-4 text-sm text-gray-600">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link href="/" className="inline-block py-1 hover:text-green-700 hover:underline">Inicio</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/productos" className="inline-block py-1 hover:text-green-700 hover:underline">Productos</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-gray-900">{title}</li>
            </ol>
          </nav>
        )}
        <div className="mb-6">
          <span className="text-4xl" aria-hidden="true">{emoji}</span>
          <h1 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-gray-600">{description}</p>
        </div>

        <form role="search" action={basePath} method="get" className="mb-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="catalog-search" className="sr-only">Buscar productos</label>
            <input
              id="catalog-search"
              name="q"
              type="search"
              defaultValue={search}
              maxLength={80}
              enterKeyHint="search"
              placeholder="Buscar por nombre, marca, SKU o código…"
              className="min-w-0 flex-1 rounded-full border border-gray-300 px-5 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/30 sm:text-sm"
            />
            {state.category && <input type="hidden" name="categoria" value={state.category} />}
            <button
              type="submit"
              className="rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
            >
              Buscar
            </button>
          </div>
          <AutoSubmit>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <label className="flex items-center gap-2 text-gray-700">
                Ordenar por
                <select
                  name="orden"
                  defaultValue={state.sort}
                  className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                >
                  {Object.entries(CATALOG_SORTS).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="flex min-h-10 items-center gap-2 text-gray-700">
                <input type="checkbox" name="disponibles" value="1" defaultChecked={state.inStockOnly} className="h-5 w-5 accent-green-600" />
                Solo disponibles
              </label>
            </div>
          </AutoSubmit>
        </form>

        {categories && categories.length > 0 && (
          <nav aria-label="Filtrar por categoría" className="-mx-4 mb-8 overflow-x-auto px-4">
            <ul className="flex gap-2 pb-2 sm:flex-wrap">
              <li>
                <Link href={catalogHref(basePath, state, 1, { category: undefined })} aria-current={!activeCategorySlug ? "page" : undefined} className={chip(!activeCategorySlug)}>
                  Todas
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={catalogHref(basePath, state, 1, { category: cat.slug })}
                    aria-current={activeCategorySlug === cat.slug ? "page" : undefined}
                    className={chip(activeCategorySlug === cat.slug)}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <p className="mb-4 text-sm text-gray-600" role="status">
          {total === 0
            ? filtered
              ? `No encontramos productos${search ? ` para “${search}”` : ""}${state.inStockOnly ? " disponibles" : ""}.`
              : "No hay productos publicados todavía."
            : `Mostrando ${firstItem}–${lastItem} de ${total} productos${search ? ` para “${search}”` : ""}.`}
        </p>

        {products.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <li key={product.id} className="flex">
                <ProductCard
                  product={product}
                  emoji={categoryEmoji(categorySlugById?.[product.category_id] ?? activeCategorySlug)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 text-center sm:p-10">
            <div className="text-5xl" aria-hidden="true">📦</div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {filtered ? "Intenta con otra búsqueda" : "Estamos preparando este catálogo"}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
              {filtered
                ? "Revisa la ortografía, busca por marca o quita el filtro “Solo disponibles”. También puedes escribirnos y verificamos disponibilidad."
                : "Los productos con precio e imagen aparecerán aquí tan pronto los añadamos al catálogo."}
            </p>
            {filtered && (
              <Link href={catalogHref(basePath, state, 1, { search: "", inStockOnly: false })} className="mt-5 inline-flex rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:border-green-600">
                Quitar filtros
              </Link>
            )}
          </div>
        )}

        {pageCount > 1 && (
          <nav aria-label="Paginación" className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm">
            {page > 1 && (
              <Link href={catalogHref(basePath, state, page - 1)} rel="prev" className="rounded-full border border-gray-300 px-4 py-2.5 font-semibold text-gray-800 hover:border-green-600">
                <span aria-hidden="true">←</span> Anterior
              </Link>
            )}
            <ul className="flex items-center gap-1">
              {pageWindow(page, pageCount).map((p, i) =>
                p === "…" ? (
                  <li key={`gap-${i}`} aria-hidden="true" className="px-2 text-gray-500">…</li>
                ) : (
                  <li key={p}>
                    <Link
                      href={catalogHref(basePath, state, p)}
                      aria-current={p === page ? "page" : undefined}
                      aria-label={`Página ${p}`}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 font-semibold ${p === page ? "bg-green-600 text-white" : "border border-gray-300 text-gray-800 hover:border-green-600"}`}
                    >
                      {p}
                    </Link>
                  </li>
                )
              )}
            </ul>
            {page < pageCount && (
              <Link href={catalogHref(basePath, state, page + 1)} rel="next" className="rounded-full border border-gray-300 px-4 py-2.5 font-semibold text-gray-800 hover:border-green-600">
                Siguiente <span aria-hidden="true">→</span>
              </Link>
            )}
          </nav>
        )}

        <div className="mt-12 rounded-3xl border border-green-100 bg-green-50 p-8 text-center">
          <h2 className="mb-2 text-lg font-bold text-gray-900">¿Buscas algo específico?</h2>
          <p className="mb-5 text-sm text-gray-600">Escríbenos y verificamos disponibilidad en tienda.</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Chatear por WhatsApp (abre en una pestaña nueva)"
            className="inline-flex rounded-full bg-[#157a3c] px-8 py-3 text-sm font-bold text-white hover:bg-[#11632f]"
          >
            Chatear por WhatsApp
          </a>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
        <p>© 2026 First Choice Pharmacy</p>
      </footer>
    </div>
  );
}
