import { NextResponse } from "next/server";
import { adminHeaders, requireAdmin, type AdminContext } from "@/lib/admin-auth";
import { parseCsv } from "@/lib/csv";
import { validateImport, type ImportIssue, type ImportRow } from "@/lib/product-import";
import { exceedsBodyLimit } from "@/lib/server-security";

// POST /api/admin/products/import  { csv: string, commit?: boolean }
//
// Without commit it is a dry run: nothing is written, the response says what
// would be created and why other rows are skipped. With commit, valid new
// rows are created as DRAFTS (never published) together with their inventory
// row. Rows whose SKU or UPC already exists are skipped, never overwritten.

const BATCH = 100;

function slugify(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// SKU/UPC values are restricted by validateImport to [A-Za-z0-9._/-], so
// quoting them for PostgREST in() lists is safe.
const quoted = (values: string[]) => values.map((v) => `"${v}"`).join(",");

async function existingCodes(ctx: AdminContext, rows: ImportRow[]) {
  const skus = new Set<string>();
  const upcs = new Set<string>();
  for (const batch of chunks(rows, BATCH)) {
    const skuList = batch.map((r) => r.sku).filter((v): v is string => Boolean(v));
    const upcList = batch.map((r) => r.upc).filter((v): v is string => Boolean(v));
    const filters = [
      ...(skuList.length ? [`sku.in.(${quoted(skuList)})`] : []),
      ...(upcList.length ? [`upc.in.(${quoted(upcList)})`] : []),
    ];
    if (!filters.length) continue;
    const params = new URLSearchParams({ select: "sku,upc", or: `(${filters.join(",")})` });
    const r = await fetch(`${ctx.url}/rest/v1/products?${params}`, { headers: adminHeaders(ctx), cache: "no-store" });
    if (!r.ok) throw new Error(`existing codes lookup failed: ${r.status}`);
    for (const row of (await r.json()) as { sku: string | null; upc: string | null }[]) {
      if (row.sku) skus.add(row.sku.toLowerCase());
      if (row.upc) upcs.add(row.upc);
    }
  }
  return { skus, upcs };
}

export async function POST(request: Request) {
  const { ctx, error } = await requireAdmin(request);
  if (error) return error;
  if (exceedsBodyLimit(request, 2_000_000)) {
    return NextResponse.json({ error: "El archivo es demasiado grande (máximo 2 MB)." }, { status: 413 });
  }

  try {
    const body = await request.json();
    if (typeof body.csv !== "string" || !body.csv.trim()) {
      return NextResponse.json({ error: "Selecciona un archivo CSV." }, { status: 400 });
    }
    const commit = body.commit === true;
    const { rows, issues, missingColumns } = validateImport(parseCsv(body.csv));
    if (missingColumns.length) {
      return NextResponse.json({ error: `Faltan columnas obligatorias: ${missingColumns.join(", ")}.` }, { status: 400 });
    }

    const categoriesResponse = await fetch(`${ctx.url}/rest/v1/categories?select=id,slug`, {
      headers: adminHeaders(ctx),
      cache: "no-store",
    });
    if (!categoriesResponse.ok) throw new Error("categories lookup failed");
    const categoryIds = new Map(
      ((await categoriesResponse.json()) as { id: string; slug: string }[]).map((c) => [c.slug, c.id])
    );
    const existing = await existingCodes(ctx, rows);

    const skipped: ImportIssue[] = [];
    const toCreate = rows.filter((row) => {
      if (!categoryIds.has(row.categorySlug)) {
        skipped.push({ line: row.line, message: `categoría "${row.categorySlug}" no existe` });
        return false;
      }
      if (row.sku && existing.skus.has(row.sku.toLowerCase())) {
        skipped.push({ line: row.line, message: `SKU ${row.sku} ya existe (no se modifica)` });
        return false;
      }
      if (row.upc && existing.upcs.has(row.upc)) {
        skipped.push({ line: row.line, message: `UPC ${row.upc} ya existe (no se modifica)` });
        return false;
      }
      return true;
    });

    const report = {
      commit,
      totalRows: rows.length + issues.length,
      toCreate: toCreate.length,
      invalid: issues,
      skipped: skipped.sort((a, b) => a.line - b.line),
      preview: toCreate.slice(0, 20).map(({ line, name, categorySlug, price, quantity, sku }) => ({ line, name, categorySlug, price, quantity, sku })),
    };
    if (!commit || !toCreate.length) return NextResponse.json({ ...report, created: 0 });

    let created = 0;
    const failed: ImportIssue[] = [];
    for (const rowsInBatch of chunks(toCreate, BATCH)) {
      const batch = rowsInBatch.map((row) => ({ ...row, slug: `${slugify(row.name)}-${crypto.randomUUID().slice(0, 8)}` }));
      const productResponse = await fetch(`${ctx.url}/rest/v1/products?select=id,slug`, {
        method: "POST",
        headers: adminHeaders(ctx, true),
        body: JSON.stringify(
          batch.map((row) => ({
            name: row.name,
            slug: row.slug,
            brand: row.brand,
            sku: row.sku,
            upc: row.upc,
            category_id: categoryIds.get(row.categorySlug),
            price: row.price,
            presentation_size: row.presentation_size,
            description: row.description,
            is_active: false,
            publication_status: "draft",
            requires_prescription: false,
          }))
        ),
        cache: "no-store",
      });
      if (!productResponse.ok) {
        console.error("Import product batch failed", productResponse.status, await productResponse.text());
        batch.forEach((row) => failed.push({ line: row.line, message: "no se pudo crear (lote rechazado por la base de datos)" }));
        continue;
      }
      // Match by slug (unique per row) rather than trusting RETURNING order.
      const createdRows = (await productResponse.json()) as { id: string; slug: string }[];
      const quantityBySlug = new Map(batch.map((row) => [row.slug, row.quantity]));
      const ids = createdRows.map((p) => p.id);
      const inventoryResponse = await fetch(`${ctx.url}/rest/v1/inventory`, {
        method: "POST",
        headers: adminHeaders(ctx, true),
        body: JSON.stringify(createdRows.map((p) => ({ product_id: p.id, quantity: quantityBySlug.get(p.slug) ?? 0, low_stock_threshold: 5 }))),
        cache: "no-store",
      });
      if (!inventoryResponse.ok) {
        // Undo this batch's products so no product exists without inventory.
        console.error("Import inventory batch failed", inventoryResponse.status);
        await fetch(`${ctx.url}/rest/v1/products?id=in.(${ids.join(",")})`, {
          method: "DELETE",
          headers: adminHeaders(ctx),
          cache: "no-store",
        });
        batch.forEach((row) => failed.push({ line: row.line, message: "no se pudo crear el inventario; el lote se revirtió" }));
        continue;
      }
      created += ids.length;
    }

    return NextResponse.json({ ...report, created, failed }, { status: created ? 201 : 502 });
  } catch (err) {
    console.error("Product import error", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "No se pudo procesar la importación." }, { status: 500 });
  }
}
