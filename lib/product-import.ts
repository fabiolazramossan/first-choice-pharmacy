// Pure validation for CSV product imports (unit-tested in tests/import.test.mjs).
// Database lookups (category ids, existing SKU/UPC) happen in the API route.

export const IMPORT_COLUMNS = [
  "name",
  "category",
  "price",
  "quantity",
  "brand",
  "sku",
  "upc",
  "presentation_size",
  "description",
] as const;
export const REQUIRED_COLUMNS = ["name", "category", "price"] as const;
export const MAX_IMPORT_ROWS = 1000;

// Spanish header aliases so a sheet exported by staff works as-is.
const HEADER_ALIASES: Record<string, (typeof IMPORT_COLUMNS)[number]> = {
  nombre: "name",
  categoria: "category",
  precio: "price",
  cantidad: "quantity",
  stock: "quantity",
  inventario: "quantity",
  marca: "brand",
  presentacion: "presentation_size",
  tamano: "presentation_size",
  descripcion: "description",
};

export type ImportRow = {
  line: number;
  name: string;
  categorySlug: string;
  price: number;
  quantity: number;
  brand: string | null;
  sku: string | null;
  upc: string | null;
  presentation_size: string | null;
  description: string | null;
};

export type ImportIssue = { line: number; message: string };

function normalizeHeader(value: string): string {
  const key = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return HEADER_ALIASES[key] ?? key;
}

function clean(value: string | undefined, max: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Parses a money value like "12.99", "$12.99" or "12,99". */
export function parsePrice(raw: string): number | null {
  const text = raw.trim().replace(/^\$/, "").replace(/\s/g, "");
  const normalized = /^\d+,\d{1,2}$/.test(text) ? text.replace(",", ".") : text;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value <= 100_000 ? value : null;
}

export function validateImport(table: string[][]): {
  rows: ImportRow[];
  issues: ImportIssue[];
  missingColumns: string[];
} {
  const [header = [], ...body] = table;
  const columns = header.map(normalizeHeader);
  const missingColumns = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
  if (missingColumns.length) return { rows: [], issues: [], missingColumns };

  const issues: ImportIssue[] = [];
  if (body.length > MAX_IMPORT_ROWS) {
    issues.push({ line: 0, message: `El archivo tiene ${body.length} filas; el máximo por importación es ${MAX_IMPORT_ROWS}.` });
    return { rows: [], issues, missingColumns };
  }

  const rows: ImportRow[] = [];
  const seenSku = new Map<string, number>();
  const seenUpc = new Map<string, number>();

  body.forEach((cells, index) => {
    const line = index + 2; // 1-based, after the header line
    const get = (column: string) => {
      const at = columns.indexOf(column);
      return at >= 0 ? cells[at] : undefined;
    };
    const problems: string[] = [];

    const name = clean(get("name"), 160);
    const categorySlug = clean(get("category"), 80).toLowerCase();
    const price = parsePrice(clean(get("price"), 20));
    const quantityText = clean(get("quantity"), 10);
    const quantity = quantityText === "" ? 0 : Number(quantityText);
    const sku = clean(get("sku"), 80) || null;
    const upc = clean(get("upc"), 80) || null;

    if (name.length < 2) problems.push("falta el nombre");
    if (!/^[a-z0-9-]{1,80}$/.test(categorySlug)) problems.push("categoría inválida (usa el identificador URL, ej. medicamentos-otc)");
    if (price === null) problems.push("precio inválido");
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 100_000) problems.push("cantidad inválida");
    if (upc && !/^\d{8,14}$/.test(upc)) problems.push("UPC debe tener 8–14 dígitos");
    if (sku && !/^[A-Za-z0-9._/-]{1,80}$/.test(sku)) problems.push("SKU solo puede tener letras, números, punto, guion, barra o guion bajo");
    if (sku) {
      const first = seenSku.get(sku.toLowerCase());
      if (first) problems.push(`SKU repetido (línea ${first})`);
      else seenSku.set(sku.toLowerCase(), line);
    }
    if (upc) {
      const first = seenUpc.get(upc);
      if (first) problems.push(`UPC repetido (línea ${first})`);
      else seenUpc.set(upc, line);
    }

    if (problems.length) {
      issues.push({ line, message: problems.join("; ") });
      return;
    }
    rows.push({
      line,
      name,
      categorySlug,
      price: price!,
      quantity,
      brand: clean(get("brand"), 100) || null,
      sku,
      upc,
      presentation_size: clean(get("presentation_size"), 120) || null,
      description: clean(get("description"), 1000) || null,
    });
  });

  return { rows, issues, missingColumns };
}
