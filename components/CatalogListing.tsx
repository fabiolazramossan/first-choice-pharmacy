import Link from "next/link";
import CatalogHeader from "@/components/CatalogHeader";
import ProductCard from "@/components/ProductCard";
import { categoryEmoji } from "@/lib/catalog-display";
import { CATALOG_PAGE_SIZE, type CatalogCategory, type CatalogProduct } from "@/lib/catalog";

const WHATSAPP_BASE = "https://wa.me/17877516646?text=";

type Props = {
  title: string;
  description: string;
  emoji: string;
  basePath: string;
  search: string;
  result: { products: CatalogProduct[]; total: number; page: number; pageCount: number };
  categories?: CatalogCategory[];
  categorySlugById?: Record<string, string>;
  activeCategorySlug?: string;
};

function pageHref(basePath: string, search: string, page: number, categorySlug?: string) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (categorySlug) params.set("categoria", categorySlug);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function CatalogListing({
  title,
  description,
  emoji,
  basePath,
  search,
  result,
  categories,
  categorySlugById,
  activeCategorySlug,
}: Props) {
  const { products, total, page, pageCount } = result;
  const whatsappHref = WHATSAPP_BASE + encodeURIComponent(`Hola, quisiera información sobre ${title}`);
  const firstItem = total === 0 ? 0 : (page - 1) * CATALOG_PAGE_SIZE + 1;
  const lastItem = Math.min(total, firstItem + products.length - 1);

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader />

      <main id="contenido" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6">
          <span className="text-4xl" aria-hidden="true">{emoji}</span>
          <h1 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-gray-600">{description}</p>
        </div>

        <form role="search" action={basePath} method="get" className="mb-6 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="catalog-search" className="sr-only">
            Buscar productos
          </label>
          <input
            id="catalog-search"
            name="q"
            type="search"
            defaultValue={search}
            maxLength={80}
            placeholder="Buscar por nombre, marca, SKU o código…"
            className="min-w-0 flex-1 rounded-full border border-gray-300 px-5 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/30"
          />
          {activeCategorySlug && categories && (
            <input type="hidden" name="categoria" value={activeCategorySlug} />
          )}
          <button
            type="submit"
            className="rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            Buscar
          </button>
        </form>

        {categories && categories.length > 0 && (
          <nav aria-label="Filtrar por categoría" className="-mx-4 mb-8 overflow-x-auto px-4">
            <ul className="flex gap-2 pb-2 sm:flex-wrap">
              <li>
                <Link
                  href={pageHref(basePath, search, 1)}
                  aria-current={!activeCategorySlug ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold ${
                    !activeCategorySlug
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 text-gray-700 hover:border-green-600"
                  }`}
                >
                  Todas
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={pageHref(basePath, search, 1, cat.slug)}
                    aria-current={activeCategorySlug === cat.slug ? "page" : undefined}
                    className={`block whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold ${
                      activeCategorySlug === cat.slug
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 text-gray-700 hover:border-green-600"
                    }`}
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
            ? search
              ? `No encontramos productos para “${search}”.`
              : "No hay productos publicados todavía."
            : `Mostrando ${firstItem}–${lastItem} de ${total} productos${search ? ` para “${search}”` : ""}.`}
        </p>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                emoji={categoryEmoji(categorySlugById?.[product.category_id] ?? activeCategorySlug)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-10 text-center">
            <div className="text-5xl" aria-hidden="true">📦</div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {search ? "Intenta con otra búsqueda" : "Estamos preparando este catálogo"}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
              {search
                ? "Revisa la ortografía o busca por marca. También puedes escribirnos y verificamos disponibilidad."
                : "Los productos con precio e imagen aparecerán aquí tan pronto los añadamos al catálogo."}
            </p>
          </div>
        )}

        {pageCount > 1 && (
          <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(basePath, search, page - 1, categories ? activeCategorySlug : undefined)}
                rel="prev"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:border-green-600"
              >
                ← Anterior
              </Link>
            ) : (
              <span aria-hidden="true" className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-400">
                ← Anterior
              </span>
            )}
            <span className="px-3 text-sm text-gray-700">
              Página {page} de {pageCount}
            </span>
            {page < pageCount ? (
              <Link
                href={pageHref(basePath, search, page + 1, categories ? activeCategorySlug : undefined)}
                rel="next"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:border-green-600"
              >
                Siguiente →
              </Link>
            ) : (
              <span aria-hidden="true" className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-400">
                Siguiente →
              </span>
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
