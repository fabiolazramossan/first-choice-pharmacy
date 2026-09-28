// Server-side catalog queries (imported only from server components and route handlers).
import { selectFromSupabase, selectPageFromSupabase } from "@/lib/supabase";
import { parseSearchTerms, productSearchFilter } from "@/lib/search";

export { parsePage } from "@/lib/search";

export const CATALOG_PAGE_SIZE = 24;

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
  category?: unknown;
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
      "id,name,slug,brand,description,price,compare_at_price,image_url,category_id,inventory(quantity),category:categories!inner(is_active)",
    // Products in a deactivated category are hidden with it.
    "category.is_active": "eq.true",
    ...publicProductFilters(),
    order: "name.asc,id.asc",
  };
  if (categoryId) query.category_id = `eq.${categoryId}`;

  const terms = parseSearchTerms(search);
  if (terms.length) {
    query.and = productSearchFilter(terms);
  }

  const { rows, total } = await selectPageFromSupabase<ProductRow>("products", query, {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  const products: CatalogProduct[] = rows.map(({ inventory, category: _category, ...product }) => ({
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

export type CatalogProductDetail = CatalogProduct & {
  presentation_size: string | null;
  category: { name: string; slug: string };
};

export async function getProductBySlug(slug: string): Promise<CatalogProductDetail | null> {
  if (!/^[a-z0-9-]{1,160}$/.test(slug)) return null;
  const rows = await selectFromSupabase<
    ProductRow & { presentation_size: string | null; category: { name: string; slug: string; is_active: boolean } }
  >("products", {
    select:
      "id,name,slug,brand,description,price,compare_at_price,image_url,category_id,presentation_size,inventory(quantity),category:categories!inner(name,slug,is_active)",
    ...publicProductFilters(),
    "category.is_active": "eq.true",
    slug: `eq.${slug}`,
    limit: "1",
  });
  const row = rows[0];
  if (!row) return null;
  const { inventory, category, ...product } = row;
  return {
    ...product,
    price: Number(product.price),
    compare_at_price: product.compare_at_price == null ? null : Number(product.compare_at_price),
    in_stock: stockOf(inventory) > 0,
    category: { name: category.name, slug: category.slug },
  };
}

/** Slugs of every publicly visible product, for the sitemap. */
export async function getPublicProductSlugs(): Promise<string[]> {
  const rows = await selectFromSupabase<{ slug: string }>("products", {
    select: "slug,category:categories!inner(is_active)",
    ...publicProductFilters(),
    "category.is_active": "eq.true",
    order: "slug.asc",
    limit: "5000",
  });
  return rows.map((row) => row.slug);
}
