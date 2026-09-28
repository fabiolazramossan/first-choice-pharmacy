// Server-side catalog queries (imported only from server components and route handlers).
import { selectFromSupabase, selectPageFromSupabase } from "@/lib/supabase";
import { CATALOG_SORTS, parseSearchTerms, productSearchFilter, type CatalogSort } from "@/lib/search";

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

function toCatalogProduct({ inventory, category: _category, ...product }: ProductRow): CatalogProduct {
  return {
    ...product,
    price: Number(product.price),
    compare_at_price: product.compare_at_price == null ? null : Number(product.compare_at_price),
    in_stock: stockOf(inventory) > 0,
  };
}

const LISTING_SELECT =
  "id,name,slug,brand,description,price,compare_at_price,image_url,category_id,inventory(quantity),category:categories!inner(is_active)";

/**
 * Public products flagged is_featured, in stock first. Cached briefly for the
 * homepage; product pages and the cart always re-check live stock.
 */
export async function getFeaturedProducts(limit = 8, cache: { revalidate?: number } = {}): Promise<CatalogProduct[]> {
  const rows = await selectFromSupabase<ProductRow>(
    "products",
    {
      select: LISTING_SELECT,
      ...publicProductFilters(),
      "category.is_active": "eq.true",
      is_featured: "eq.true",
      order: "name.asc,id.asc",
      limit: String(limit),
    },
    cache
  );
  return rows.map(toCatalogProduct).sort((a, b) => Number(b.in_stock) - Number(a.in_stock));
}

export async function getActiveCategories(cache: { revalidate?: number } = {}): Promise<CatalogCategory[]> {
  return selectFromSupabase<CatalogCategory>(
    "categories",
    {
      select: "id,name,slug,description,sort_order",
      is_active: "eq.true",
      order: "sort_order.asc,name.asc",
    },
    cache
  );
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
  sort = "nombre",
  inStockOnly = false,
  excludeId,
}: {
  categoryId?: string;
  search?: string | null;
  page: number;
  pageSize?: number;
  sort?: CatalogSort;
  /** Only products with stock > 0 (inner join on inventory). */
  inStockOnly?: boolean;
  excludeId?: string;
}) {
  const query: Record<string, string> = {
    select:
      `id,name,slug,brand,description,price,compare_at_price,image_url,category_id,${inStockOnly ? "inventory!inner" : "inventory"}(quantity),category:categories!inner(is_active)`,
    // Products in a deactivated category are hidden with it.
    "category.is_active": "eq.true",
    ...publicProductFilters(),
    order: CATALOG_SORTS[sort].order,
  };
  if (inStockOnly) query["inventory.quantity"] = "gt.0";
  if (excludeId) query.id = `neq.${excludeId}`;
  if (categoryId) query.category_id = `eq.${categoryId}`;

  const terms = parseSearchTerms(search);
  if (terms.length) {
    query.and = productSearchFilter(terms);
  }

  const { rows, total } = await selectPageFromSupabase<ProductRow>("products", query, {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  const products = rows.map(toCatalogProduct);

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
  /** How many one order may include now: min(stock, 10); 0 = sold out. */
  max_quantity: number;
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
    max_quantity: Math.min(stockOf(inventory), 10),
    category: { name: category.name, slug: category.slug },
  };
}

/** Slugs of every publicly visible product, for the sitemap. */
export async function getPublicProductSlugs(): Promise<string[]> {
  // Supabase returns at most 1,000 rows per request, so read in pages.
  const slugs: string[] = [];
  for (let offset = 0; offset < 50_000; offset += 1000) {
    const rows = await selectFromSupabase<{ slug: string }>("products", {
      select: "slug,category:categories!inner(is_active)",
      ...publicProductFilters(),
      "category.is_active": "eq.true",
      order: "slug.asc",
      offset: String(offset),
      limit: "1000",
    });
    slugs.push(...rows.map((row) => row.slug));
    if (rows.length < 1000) break;
  }
  return slugs;
}

export type CartAvailability = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  /** How many the customer may order now: min(stock, 10); 0 = sold out. */
  max_quantity: number;
};

/** Current price/availability for cart items. Missing ids are not publicly available. */
export async function getCartAvailability(ids: string[]): Promise<CartAvailability[]> {
  if (!ids.length) return [];
  const rows = await selectFromSupabase<ProductRow>("products", {
    select: "id,name,slug,price,image_url,inventory(quantity),category:categories!inner(is_active)",
    ...publicProductFilters(),
    "category.is_active": "eq.true",
    id: `in.(${ids.join(",")})`,
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    image_url: row.image_url,
    max_quantity: Math.min(stockOf(row.inventory), 10),
  }));
}
