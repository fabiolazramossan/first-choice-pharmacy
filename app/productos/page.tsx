import type { Metadata } from "next";
import CatalogListing from "@/components/CatalogListing";
import { getActiveCategories, parsePage, searchCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Busca medicamentos sin receta, vitaminas, primeros auxilios y más en First Choice Pharmacy, San Juan, Puerto Rico.",
  alternates: { canonical: "/productos" },
};

type Props = {
  searchParams: Promise<{ q?: string | string[]; categoria?: string | string[]; page?: string | string[] }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductosPage({ searchParams }: Props) {
  const query = await searchParams;
  const search = (first(query.q) ?? "").trim().slice(0, 80);
  const categories = await getActiveCategories();
  const active = categories.find((c) => c.slug === first(query.categoria));

  const result = await searchCatalog({
    categoryId: active?.id,
    search,
    page: parsePage(first(query.page)),
  });

  return (
    <CatalogListing
      title={active ? active.name : search ? "Resultados de búsqueda" : "Todos los productos"}
      description={active?.description ?? "Busca en todo nuestro catálogo de productos sin receta."}
      emoji={active ? "🛍️" : "🔎"}
      basePath="/productos"
      search={search}
      result={result}
      categories={categories}
      categorySlugById={Object.fromEntries(categories.map((c) => [c.id, c.slug]))}
      activeCategorySlug={active?.slug}
    />
  );
}
