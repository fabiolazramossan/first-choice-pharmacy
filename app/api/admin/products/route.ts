import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function adminContext() {
  const token = (await cookies()).get("fc_admin_session")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!token || !url || !key) return null;
  const roles = await fetch(`${url}/rest/v1/user_roles?select=role&user_id=eq.(select auth.uid())`, { headers:{apikey:key,Authorization:`Bearer ${token}`}, cache:"no-store" });
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
