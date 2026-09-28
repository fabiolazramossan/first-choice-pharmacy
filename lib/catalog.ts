// Server-side catalog queries (imported only from server components and route handlers).
import { selectFromSupabase, selectPageFromSupabase } from "@/lib/supabase";

export const CATALOG_PAGE_SIZE = 24;
const MAX_PAGE = 1000;
const MAX_SEARCH_TERMS = 5;

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order?: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  category_id: string;
  in_stock: boolean;
};

type ProductRow = Omit<CatalogProduct, "in_stock"> & {
  inventory: { quantity: number } | { quantity: number }[] | null;
};

/**
 * The single definition of "publicly visible product": active, explicitly
 * published, and OTC. Test products ("[PRUEBA] ...") are hidden in production.
 * RLS in Supabase remains the real authorization boundary.
 */
export function publicProductFilters(): Record<string, string> {
  const filters: Record<string, string> = {
    is_active: "eq.true",
    publication_status: "eq.published",
    requires_prescription: "eq.false",
  };
  if (process.env.VERCEL_ENV === "production") {
    filters.name = "not.like.[PRUEBA]*";
  }
  return filters;
}

export function stockOf(inventory: ProductRow["inventory"]): number {
  const row = Array.isArray(inventory) ? inventory[0] : inventory;
  const quantity = Number(row?.quantity);
  // Missing inventory data fails closed: the product is treated as sold out.
  return Number.isInteger(quantity) && quantity > 0 ? quantity : 0;
}

/**
 * Normalizes free-text search into at most five safe terms. Only letters,
 * digits and hyphens survive, so terms cannot inject PostgREST filter syntax
 * (commas, parentheses, dots) or LIKE wildcards.
 */
export function parseSearchTerms(raw: string | null | undefined): string[] {
  return String(raw ?? "")
    .normalize("NFC")
    .slice(0, 80)
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((term) => term.replace(/^-+|-+$/g, "").toLowerCase())
    .filter(Boolean)
    .slice(0, MAX_SEARCH_TERMS);
}

export function parsePage(raw: string | null | undefined): number {
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1;
}

export async function getActiveCategories(): Promise<CatalogCategory[]> {
  return selectFromSupabase<CatalogCategory>("categories", {
    select: "id,name,slug,description,sort_order",
    is_active: "eq.true",
    order: "sort_order.asc,name.asc",
  });
}

export async function getCategoryBySlug(slug: string): Promise<CatalogCategory | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const rows = await selectFromSupabase<CatalogCategory>("categories", {
    select: "id,name,slug,description",
    slug: `eq.${slug}`,
    is_active: "eq.true",
    limit: "1",
  });
  return rows[0] ?? null;
}

export async function searchCatalog({
  categoryId,
  search,
  page,
  pageSize = CATALOG_PAGE_SIZE,
}: {
  categoryId?: string;
  search?: string | null;
  page: number;
  pageSize?: number;
}) {
  const query: Record<string, string> = {
    select:
      "id,name,slug,brand,description,price,compare_at_price,image_url,category_id,inventory(quantity)",
    ...publicProductFilters(),
    order: "name.asc,id.asc",
  };
  if (categoryId) query.category_id = `eq.${categoryId}`;

  const terms = parseSearchTerms(search);
  if (terms.length) {
    // Every term must match at least one of name, brand, SKU or UPC.
    query.and = `(${terms
      .map((t) => `or(name.ilike.*${t}*,brand.ilike.*${t}*,sku.ilike.*${t}*,upc.ilike.*${t}*)`)
      .join(",")})`;
  }

  const { rows, total } = await selectPageFromSupabase<ProductRow>("products", query, {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  const products: CatalogProduct[] = rows.map(({ inventory, ...product }) => ({
    ...product,
    price: Number(product.price),
    compare_at_price: product.compare_at_price == null ? null : Number(product.compare_at_price),
    in_stock: stockOf(inventory) > 0,
  }));

  return {
    products,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    terms,
  };
}
