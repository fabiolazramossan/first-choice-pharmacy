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
  return NextResponse.json({products:await response.json()});
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
