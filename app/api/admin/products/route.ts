import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function adminContext() {
  const token = (await cookies()).get("fc_admin_session")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!token || !url || !key) return null;
  const userResponse = await fetch(`${url}/auth/v1/user`, { headers:{apikey:key,Authorization:`Bearer ${token}`}, cache:"no-store" });
  if (!userResponse.ok) return null;
  const user = await userResponse.json();
  const roles = await fetch(`${url}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(user.id)}`, { headers:{apikey:key,Authorization:`Bearer ${token}`}, cache:"no-store" });
  if (!roles.ok) return null;
  const rows = await roles.json();
  if (!rows.some((r:{role?:string}) => ["admin","manager"].includes(r.role || ""))) return null;
  return {url,key,token};
}

export async function GET() {
  const ctx=await adminContext();
  if(!ctx) return NextResponse.json({error:"No autorizado."},{status:401});
  const response=await fetch(`${ctx.url}/rest/v1/products?select=id,name,brand,sku,upc,price,is_active,is_featured,publication_status,inventory(quantity,low_stock_threshold)&order=name.asc&limit=500`,{headers:{apikey:ctx.key,Authorization:`Bearer ${ctx.token}`},cache:"no-store"});
  if(!response.ok) return NextResponse.json({error:"No se pudieron cargar los productos."},{status:502});
  const categoriesResponse=await fetch(`${ctx.url}/rest/v1/categories?select=id,name,slug,is_active&order=sort_order.asc,name.asc`,{headers:{apikey:ctx.key,Authorization:`Bearer ${ctx.token}`},cache:"no-store"});
  const categories=categoriesResponse.ok?await categoriesResponse.json():[];
  return NextResponse.json({products:await response.json(),categories});
}


export async function PATCH(request: Request) {
  const ctx = await adminContext();
  if (!ctx) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
    const brand = typeof body.brand === "string" ? body.brand.trim().slice(0, 100) : "";
    const price = Number(body.price);
    const quantity = Number(body.quantity);
    const isActive = body.is_active === true;
    if (!id || !name || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json({ error: "Datos del producto inválidos." }, { status: 400 });
    }
    const headers = { apikey: ctx.key, Authorization: `Bearer ${ctx.token}`, "Content-Type": "application/json", Prefer: "return=representation" };
    const productResponse = await fetch(`${ctx.url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH", headers,
      body: JSON.stringify({ name, brand: brand || null, price, is_active: isActive, updated_at: new Date().toISOString() }),
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
  const ctx = await adminContext();
  if (!ctx) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
    const brand = typeof body.brand === "string" ? body.brand.trim().slice(0, 100) : "";
    const sku = typeof body.sku === "string" ? body.sku.trim().slice(0, 80) : "";
    const upc = typeof body.upc === "string" ? body.upc.trim().slice(0, 80) : "";
    const categoryId = typeof body.category_id === "string" ? body.category_id : "";
    const price = Number(body.price);
    const quantity = Number(body.quantity);
    const isActive = body.is_active === true;
    if (!name || !categoryId || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json({ error: "Completa nombre, categoría, precio y stock correctamente." }, { status: 400 });
    }
    const headers = { apikey: ctx.key, Authorization: `Bearer ${ctx.token}`, "Content-Type": "application/json", Prefer: "return=representation" };
    const slug = `${slugify(name)}-${crypto.randomUUID().slice(0,8)}`;
    const productResponse = await fetch(`${ctx.url}/rest/v1/products`, {
      method: "POST", headers,
      body: JSON.stringify({ name, slug, brand: brand || null, sku: sku || null, upc: upc || null, category_id: categoryId, price, is_active: isActive, publication_status: isActive ? "published" : "draft", requires_prescription: false }),
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
