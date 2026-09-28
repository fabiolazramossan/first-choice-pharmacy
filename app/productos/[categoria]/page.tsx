import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogListing from "@/components/CatalogListing";
import { categoryEmoji } from "@/lib/catalog-display";
import { getCategoryBySlug, parsePage, searchCatalog } from "@/lib/catalog";

type Props = {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const category = await getCategoryBySlug(categoria).catch(() => null);
  if (!category) return { title: "Categoría no encontrada", robots: { index: false } };
  return {
    title: category.name,
    description:
      category.description ?? `${category.name} disponibles en First Choice Pharmacy, San Juan, Puerto Rico.`,
    alternates: { canonical: `/productos/${category.slug}` },
  };
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { categoria } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(categoria);
  if (!category) notFound();

  const search = (first(query.q) ?? "").trim().slice(0, 80);
  const result = await searchCatalog({
    categoryId: category.id,
    search,
    page: parsePage(first(query.page)),
  });

  return (
    <CatalogListing
      title={category.name}
      description={category.description ?? "Productos disponibles en tienda."}
      emoji={categoryEmoji(category.slug)}
      basePath={`/productos/${category.slug}`}
      search={search}
      result={result}
      activeCategorySlug={category.slug}
    />
  );
}
