import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { parsePage, parseSearchTerms, productSearchFilter } from "@/lib/search";

const ADMIN_PAGE_SIZE = 50;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRODUCT_FIELDS =
  "id,name,brand,sku,upc,price,image_url,presentation_size,pan_eligibility_status,is_active,is_featured,publication_status,category_id";

// GET /api/admin/products?q=&status=all|published|draft|inactive&category=<uuid>&stock=all|in|out&page=1
export async function GET(request: Request) {
  const { ctx, error } = await requireAdmin();
  if (error) return error;

  const params = new URL(request.url).searchParams;
  const page = parsePage(params.get("page"));
  const status = params.get("status");
  const stock = params.get("stock");
  const category = params.get("category") ?? "";

  const query = new URLSearchParams({ order: "name.asc,id.asc" });
  // !inner lets stock filters on the embedded inventory row filter products.
  const inventoryEmbed = stock === "in" || stock === "out" ? "inventory!inner" : "inventory";
  query.set("select", `${PRODUCT_FIELDS},${inventoryEmbed}(quantity,low_stock_threshold)`);
  if (status === "published") {
    query.set("is_active", "eq.true");
    query.set("publication_status", "eq.published");
  } else if (status === "draft") {
    query.set("publication_status", "neq.published");
  } else if (status === "inactive") {
    query.set("is_active", "eq.false");
  }
  if (stock === "out") query.set("inventory.quantity", "eq.0");
  if (stock === "in") query.set("inventory.quantity", "gt.0");
  if (UUID.test(category)) query.set("category_id", `eq.${category}`);
  const terms = parseSearchTerms(params.get("q"));
  if (terms.length) query.set("and", productSearchFilter(terms));
  query.set("offset", String((page - 1) * ADMIN_PAGE_SIZE));
  query.set("limit", String(ADMIN_PAGE_SIZE));

  const headers = { apikey: ctx.key, Authorization: `Bearer ${ctx.token}` };
  const [response, categoriesResponse] = await Promise.all([
    fetch(`${ctx.url}/rest/v1/products?${query}`, { headers: { ...headers, Prefer: "count=exact" }, cache: "no-store" }),
    fetch(`${ctx.url}/rest/v1/categories?select=id,name,slug,description,sort_order,is_active&order=sort_order.asc,name.asc`, { headers, cache: "no-store" }),
  ]);
  if (!response.ok && response.status !== 416) {
    console.error("Admin product list failed", response.status);
    return NextResponse.json({ error: "No se pudieron cargar los productos." }, { status: 502 });
  }
  const total = Number(response.headers.get("content-range")?.split("/")[1]) || 0;
  const products = response.status === 416 ? [] : await response.json();
  const categories = categoriesResponse.ok ? await categoriesResponse.json() : [];
  return NextResponse.json({
    products,
    categories,
    total,
    page,
    pageSize: ADMIN_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  });
}

export async function PATCH(request: Request) {
  const { ctx, error } = await requireAdmin(request);
  if (error) return error;
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
    const brand = typeof body.brand === "string" ? body.brand.trim().slice(0, 100) : "";
    const sku = typeof body.sku === "string" ? body.sku.trim().slice(0, 80) : "";
    const imageUrl = typeof body.image_url === "string" ? body.image_url.trim().slice(0, 500) : "";
    const presentationSize = typeof body.presentation_size === "string" ? body.presentation_size.trim().slice(0, 120) : "";
    const panStatus = ["eligible","ineligible","unverified"].includes(body.pan_eligibility_status) ? body.pan_eligibility_status : "unverified";
    const price = Number(body.price);
    const quantity = Number(body.quantity);
    const isActive = body.is_active === true;
    const categoryId = typeof body.category_id === "string" && UUID.test(body.category_id) ? body.category_id : null;
    if (!id || !name || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json({ error: "Datos del producto inválidos." }, { status: 400 });
    }
    if (isActive && (!sku || !presentationSize || price <= 0 || !imageUrl.startsWith(`${ctx.url}/storage/v1/object/public/`) || !["eligible","ineligible"].includes(panStatus))) {
      return NextResponse.json({ error: "Para publicar: completa SKU, presentación/tamaño, precio mayor de $0, clasificación PAN e imagen subida a Supabase Storage." }, { status: 400 });
    }
    const headers = { apikey: ctx.key, Authorization: `Bearer ${ctx.token}`, "Content-Type": "application/json", Prefer: "return=representation" };
    const productResponse = await fetch(`${ctx.url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH", headers,
      body: JSON.stringify({ name, brand: brand || null, sku: sku || null, price, image_url: imageUrl || null, presentation_size: presentationSize || null, pan_eligibility_status: panStatus, ...(categoryId ? { category_id: categoryId } : {}), is_active: isActive, publication_status: isActive ? "published" : "draft", updated_at: new Date().toISOString() }),
      cache: "no-store"
    });
    if (!productResponse.ok) {
      const detail = await productResponse.text();
      console.error("Admin product update failed", productResponse.status, detail);
      return NextResponse.json({ error: "No se pudo actualizar el producto." }, { status: 502 });
    }
    const inventoryResponse = await fetch(`${ctx.url}/rest/v1/inventory?product_id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH", headers,
      body: JSON.stringify({ quantity, updated_at: new Date().toISOString() }),
      cache: "no-store"
    });
    if (!inventoryResponse.ok) {
      const detail = await inventoryResponse.text();
      console.error("Admin inventory update failed", inventoryResponse.status, detail);
      return NextResponse.json({ error: "Producto actualizado, pero falló el inventario." }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el producto." }, { status: 500 });
  }
}


function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

export async function POST(request: Request) {
  const { ctx, error } = await requireAdmin(request);
  if (error) return error;
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
    const brand = typeof body.brand === "string" ? body.brand.trim().slice(0, 100) : "";
    const sku = typeof body.sku === "string" ? body.sku.trim().slice(0, 80) : "";
    const upc = typeof body.upc === "string" ? body.upc.trim().slice(0, 80) : "";
    const categoryId = typeof body.category_id === "string" ? body.category_id : "";
    const price = Number(body.price);
    const quantity = Number(body.quantity);
    if (!name || !categoryId || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json({ error: "Completa nombre, categoría, precio y stock correctamente." }, { status: 400 });
    }
    const headers = { apikey: ctx.key, Authorization: `Bearer ${ctx.token}`, "Content-Type": "application/json", Prefer: "return=representation" };
    // New products always start as drafts: publication readiness (image, SKU,
    // presentation, PAN) is only captured and enforced by the edit flow (PATCH).
    const slug = `${slugify(name)}-${crypto.randomUUID().slice(0,8)}`;
    const productResponse = await fetch(`${ctx.url}/rest/v1/products`, {
      method: "POST", headers,
      body: JSON.stringify({ name, slug, brand: brand || null, sku: sku || null, upc: upc || null, category_id: categoryId, price, is_active: false, publication_status: "draft", requires_prescription: false }),
      cache: "no-store"
    });
    if (!productResponse.ok) {
      const detail = await productResponse.text();
      console.error("Admin product create failed", productResponse.status, detail);
      const duplicate = productResponse.status === 409;
      return NextResponse.json({ error: duplicate ? "Ese SKU o UPC ya existe." : "No se pudo crear el producto." }, { status: duplicate ? 409 : 502 });
    }
    const created = (await productResponse.json())[0];
    const inventoryResponse = await fetch(`${ctx.url}/rest/v1/inventory`, {
      method: "POST", headers,
      body: JSON.stringify({ product_id: created.id, quantity, low_stock_threshold: 5 }),
      cache: "no-store"
    });
    if (!inventoryResponse.ok) {
      await fetch(`${ctx.url}/rest/v1/products?id=eq.${encodeURIComponent(created.id)}`, { method: "DELETE", headers, cache: "no-store" });
      return NextResponse.json({ error: "No se pudo crear el inventario del producto." }, { status: 502 });
    }
    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear el producto." }, { status: 500 });
  }
}
