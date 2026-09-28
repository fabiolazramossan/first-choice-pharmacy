import type { Metadata } from "next";
import CatalogListing from "@/components/CatalogListing";
import { getActiveCategories, searchCatalog } from "@/lib/catalog";
import { catalogRobots, readCatalogParams } from "@/lib/search";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = readCatalogParams(await searchParams);
  const { canonical, index } = catalogRobots(params, "/productos");
  return {
    title: params.search ? `Resultados para “${params.search}”` : "Productos",
    description:
      "Busca medicamentos sin receta, vitaminas, primeros auxilios y más en First Choice Pharmacy, San Juan, Puerto Rico.",
    alternates: { canonical },
    robots: index ? undefined : { index: false, follow: true },
  };
}

export default async function ProductosPage({ searchParams }: Props) {
  const params = readCatalogParams(await searchParams);
  const categories = await getActiveCategories();
  const active = categories.find((c) => c.slug === params.category);

  const result = await searchCatalog({
    categoryId: active?.id,
    search: params.search,
    page: params.page,
    sort: params.sort,
    inStockOnly: params.inStockOnly,
  });

  return (
    <CatalogListing
      title={active ? active.name : params.search ? "Resultados de búsqueda" : "Todos los productos"}
      description={active?.description ?? "Busca en todo nuestro catálogo de productos sin receta."}
      emoji={active ? "🛍️" : "🔎"}
      basePath="/productos"
      state={{ search: params.search, sort: params.sort, inStockOnly: params.inStockOnly, category: active?.slug }}
      result={result}
      categories={categories}
      categorySlugById={Object.fromEntries(categories.map((c) => [c.id, c.slug]))}
      activeCategorySlug={active?.slug}
    />
  );
}
