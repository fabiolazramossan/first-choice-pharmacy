// Pure, dependency-free search helpers (unit-tested in tests/search.test.mjs).

const MAX_PAGE = 1000;
const MAX_SEARCH_TERMS = 5;

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

const ACCENT_CLASSES: Record<string, string> = {
  a: "[aáàäâAÁÀÄÂ]",
  e: "[eéèëêEÉÈËÊ]",
  i: "[iíìïîIÍÌÏÎ]",
  o: "[oóòöôOÓÒÖÔ]",
  u: "[uúùüûUÚÙÜÛ]",
  n: "[nñNÑ]",
};

/** Removes diacritics: "Acetaminofén" → "acetaminofen". */
export function foldAccents(term: string): string {
  return term.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/**
 * Case- and accent-insensitive POSIX regex for one search term, used with
 * PostgREST `imatch` (~*). Terms only contain letters, digits and hyphens
 * (see parseSearchTerms), so no regex metacharacters can reach the database.
 * No database extension (unaccent) is required.
 */
export function accentInsensitivePattern(term: string): string {
  return [...foldAccents(term)].map((ch) => ACCENT_CLASSES[ch] ?? ch).join("");
}

export function parsePage(raw: string | null | undefined): number {
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1;
}

/**
 * PostgREST `and` filter: every term must match name, brand, SKU or UPC. Name
 * and brand ignore accents ("acetaminofen" finds "Acetaminofén"). Quoted
 * values are only unquoted by PostgREST inside and()/or() groups, which is
 * always the case here. Pass terms from parseSearchTerms only.
 */
export function productSearchFilter(terms: string[]): string {
  return `(${terms
    .map((t) => {
      const pattern = accentInsensitivePattern(t);
      const plain = foldAccents(t);
      return `or(name.imatch."${pattern}",brand.imatch."${pattern}",sku.ilike.*${plain}*,upc.ilike.*${plain}*)`;
    })
    .join(",")})`;
}

export const CATALOG_SORTS = {
  nombre: { label: "Nombre (A–Z)", order: "name.asc,id.asc" },
  "precio-asc": { label: "Precio: menor a mayor", order: "price.asc,name.asc,id.asc" },
  "precio-desc": { label: "Precio: mayor a menor", order: "price.desc,name.asc,id.asc" },
} as const;

export type CatalogSort = keyof typeof CATALOG_SORTS;

export function parseSort(raw: string | null | undefined): CatalogSort {
  return raw && Object.hasOwn(CATALOG_SORTS, raw) ? (raw as CatalogSort) : "nombre";
}

type RawParams = Record<string, string | string[] | undefined>;
const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Reads catalog URL parameters (?q, ?categoria, ?orden, ?disponibles, ?page). */
export function readCatalogParams(params: RawParams) {
  const category = firstParam(params.categoria);
  return {
    search: (firstParam(params.q) ?? "").trim().slice(0, 80),
    sort: parseSort(firstParam(params.orden)),
    inStockOnly: firstParam(params.disponibles) === "1",
    page: parsePage(firstParam(params.page)),
    category: category && /^[a-z0-9-]{1,80}$/.test(category) ? category : undefined,
  };
}

/**
 * Search-engine rules for a catalog listing: filtered/sorted variants are
 * noindex (follow), paginated pages canonicalize to themselves.
 */
export function catalogRobots(p: ReturnType<typeof readCatalogParams>, basePath: string) {
  const variant = Boolean(p.search || p.inStockOnly || p.sort !== "nombre");
  const canonicalParams = new URLSearchParams();
  if (p.category) canonicalParams.set("categoria", p.category);
  if (p.page > 1) canonicalParams.set("page", String(p.page));
  const qs = canonicalParams.toString();
  return {
    canonical: qs ? `${basePath}?${qs}` : basePath,
    index: !variant,
  };
}
