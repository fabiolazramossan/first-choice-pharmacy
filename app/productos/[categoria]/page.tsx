import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogListing from "@/components/CatalogListing";
import { categoryEmoji } from "@/lib/catalog-display";
import { getCategoryBySlug, searchCatalog } from "@/lib/catalog";
import { catalogRobots, readCatalogParams } from "@/lib/search";

type Props = {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const category = await getCategoryBySlug(categoria).catch(() => null);
  if (!category) return { title: "Categoría no encontrada", robots: { index: false } };
  // The category is in the path here, so it must not also be a query parameter.
  const query = { ...readCatalogParams(await searchParams), category: undefined };
  const { canonical, index } = catalogRobots(query, `/productos/${category.slug}`);
  return {
    title: category.name,
    description:
      category.description ?? `${category.name} disponibles en First Choice Pharmacy, San Juan, Puerto Rico.`,
    alternates: { canonical },
    robots: index ? undefined : { index: false, follow: true },
  };
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { categoria } = await params;
  const query = readCatalogParams(await searchParams);
  const category = await getCategoryBySlug(categoria);
  if (!category) notFound();

  const result = await searchCatalog({
    categoryId: category.id,
    search: query.search,
    page: query.page,
    sort: query.sort,
    inStockOnly: query.inStockOnly,
  });

  return (
    <CatalogListing
      title={category.name}
      description={category.description ?? "Productos disponibles en tienda."}
      emoji={categoryEmoji(category.slug)}
      basePath={`/productos/${category.slug}`}
      state={{ search: query.search, sort: query.sort, inStockOnly: query.inStockOnly }}
      result={result}
      activeCategorySlug={category.slug}
    />
  );
}
