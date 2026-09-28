import { NextResponse } from "next/server";
import { adminHeaders, requireAdmin, type AdminContext } from "@/lib/admin-auth";
import { parsePage, parseSearchTerms, productSearchFilter } from "@/lib/search";

const PAGE_SIZE = 50;
// Supabase returns at most 1,000 rows per request (db-max-rows), so scans page.
const SCAN_CHUNK = 1000;
const PRODUCT_FIELDS = "id,name,brand,sku,upc,is_active";

type CompactRow = { product_id: string; quantity: number; low_stock_threshold: number };
type ProductWithInventory = {
  id: string;
  name: string;
  brand: string | null;
  sku: string | null;
  upc: string | null;
  is_active: boolean;
  inventory: { quantity: number; low_stock_threshold: number; updated_at: string } | { quantity: number; low_stock_threshold: number; updated_at: string }[];
};

const isLow = (r: CompactRow) => r.quantity > 0 && r.quantity <= r.low_stock_threshold;

// Response rows keep the shape the Inventory screen has always used.
function toRow(p: ProductWithInventory) {
  const inv = Array.isArray(p.inventory) ? p.inventory[0] : p.inventory;
  return {
    product_id: p.id,
    quantity: inv?.quantity ?? 0,
    low_stock_threshold: inv?.low_stock_threshold ?? 0,
    updated_at: inv?.updated_at ?? null,
    products: { id: p.id, name: p.name, brand: p.brand, sku: p.sku, upc: p.upc, is_active: p.is_active },
  };
}

async function fetchAll<T>(ctx: AdminContext, path: string, params: URLSearchParams): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += SCAN_CHUNK) {
    params.set("offset", String(offset));
    params.set("limit", String(SCAN_CHUNK));
    const r = await fetch(`${ctx.url}/rest/v1/${path}?${params}`, { headers: adminHeaders(ctx), cache: "no-store" });
    if (!r.ok) throw new Error(`${path} scan failed: ${r.status}`);
    const chunk = (await r.json()) as T[];
    rows.push(...chunk);
    if (chunk.length < SCAN_CHUNK) return rows;
  }
}

// GET /api/admin/inventory?q=&filter=all|low|out|in&page=1
export async function GET(request: Request) {
  const { ctx, error } = await requireAdmin();
  if (error) return error;

  try {
    const params = new URL(request.url).searchParams;
    const page = parsePage(params.get("page"));
    const filter = params.get("filter") ?? "all";
    const terms = parseSearchTerms(params.get("q"));

    // Compact scan (3 numbers per product) for totals and the low-stock filter,
    // which compares two columns and so cannot be expressed as a REST filter.
    const compact = await fetchAll<CompactRow>(
      ctx,
      "inventory",
      new URLSearchParams({ select: "product_id,quantity,low_stock_threshold", order: "product_id.asc" })
    );
    const stats = {
      total: compact.length,
      units: compact.reduce((sum, r) => sum + r.quantity, 0),
      low: compact.filter(isLow).length,
      out: compact.filter((r) => r.quantity === 0).length,
    };

    const select = `${PRODUCT_FIELDS},inventory!inner(quantity,low_stock_threshold,updated_at)`;

    if (filter === "low") {
      let low = compact.filter(isLow);
      if (terms.length) {
        const matching = await fetchAll<{ id: string }>(
          ctx,
          "products",
          new URLSearchParams({ select: "id", and: productSearchFilter(terms), order: "id.asc" })
        );
        const ids = new Set(matching.map((m) => m.id));
        low = low.filter((r) => ids.has(r.product_id));
      }
      low.sort((a, b) => a.quantity - b.quantity || a.product_id.localeCompare(b.product_id));
      const pageIds = low.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((r) => r.product_id);
      let rows: ReturnType<typeof toRow>[] = [];
      if (pageIds.length) {
        const r = await fetch(
          `${ctx.url}/rest/v1/products?${new URLSearchParams({ select, id: `in.(${pageIds.join(",")})` })}`,
          { headers: adminHeaders(ctx), cache: "no-store" }
        );
        if (!r.ok) throw new Error(`low stock page failed: ${r.status}`);
        const byId = new Map(((await r.json()) as ProductWithInventory[]).map((p) => [p.id, toRow(p)]));
        rows = pageIds.map((id) => byId.get(id)).filter((row): row is ReturnType<typeof toRow> => Boolean(row));
      }
      return NextResponse.json({
        inventory: rows,
        stats,
        total: low.length,
        page,
        pageCount: Math.max(1, Math.ceil(low.length / PAGE_SIZE)),
      });
    }

    const query = new URLSearchParams({
      select,
      order: "inventory(quantity).asc,name.asc,id.asc",
      offset: String((page - 1) * PAGE_SIZE),
      limit: String(PAGE_SIZE),
    });
    if (filter === "out") query.set("inventory.quantity", "eq.0");
    if (filter === "in") query.set("inventory.quantity", "gt.0");
    if (terms.length) query.set("and", productSearchFilter(terms));

    const r = await fetch(`${ctx.url}/rest/v1/products?${query}`, {
      headers: { ...adminHeaders(ctx), Prefer: "count=exact" },
      cache: "no-store",
    });
    if (!r.ok && r.status !== 416) throw new Error(`inventory page failed: ${r.status}`);
    const total = Number(r.headers.get("content-range")?.split("/")[1]) || 0;
    const products = r.status === 416 ? [] : ((await r.json()) as ProductWithInventory[]);
    return NextResponse.json({
      inventory: products.map(toRow),
      stats,
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (err) {
    console.error("Admin inventory list failed", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "No se pudo cargar el inventario." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  const { ctx: c, error } = await requireAdmin(request);
  if (error) return error;
  try {
    const b = await request.json();
    const productId = typeof b.product_id === "string" ? b.product_id : "";
    const quantity = Number(b.quantity);
    const threshold = Number(b.low_stock_threshold);
    const expected = Number(b.expected_quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(threshold) || threshold < 0) {
      return NextResponse.json({ error: "Cantidad o alerta inválida." }, { status: 400 });
    }
    // Optimistic concurrency: only apply if stock still equals what the admin saw.
    const guard = Number.isInteger(expected) && expected >= 0 ? `&quantity=eq.${expected}` : "";
    const r = await fetch(`${c.url}/rest/v1/inventory?product_id=eq.${encodeURIComponent(productId)}${guard}`, {
      method: "PATCH",
      headers: adminHeaders(c, true),
      body: JSON.stringify({ quantity, low_stock_threshold: threshold, updated_at: new Date().toISOString() }),
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ error: "No se pudo actualizar el inventario." }, { status: 502 });
    const rows = await r.json();
    if (!rows.length) {
      return guard
        ? NextResponse.json({ error: "El inventario cambió mientras editabas. Recarga y vuelve a intentarlo." }, { status: 409 })
        : NextResponse.json({ error: "No se encontró el inventario." }, { status: 404 });
    }
    return NextResponse.json({ success: true, inventory: rows[0] });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }
}
