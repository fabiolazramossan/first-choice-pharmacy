import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function adminContext(){
 const token=(await cookies()).get("fc_admin_session")?.value;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
 if(!token||!url||!key)return null;
 const u=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${token}`},cache:"no-store"});
 if(!u.ok)return null; const user=await u.json();
 const rr=await fetch(`${url}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(user.id)}`,{headers:{apikey:key,Authorization:`Bearer ${token}`},cache:"no-store"});
 if(!rr.ok)return null; const roles=await rr.json();
 if(!roles.some((r:{role?:string})=>["admin","manager"].includes(r.role||"")))return null;
 return {url,key,token};
}
export async function GET(){
 const c=await adminContext(); if(!c)return NextResponse.json({error:"No autorizado."},{status:401});
 const r=await fetch(`${c.url}/rest/v1/inventory?select=product_id,quantity,low_stock_threshold,updated_at,products(id,name,brand,sku,upc,is_active)&order=quantity.asc&limit=1000`,{headers:{apikey:c.key,Authorization:`Bearer ${c.token}`},cache:"no-store"});
 if(!r.ok)return NextResponse.json({error:"No se pudo cargar el inventario."},{status:502});
 return NextResponse.json({inventory:await r.json()});
}
export async function PATCH(request:Request){
 const c=await adminContext(); if(!c)return NextResponse.json({error:"No autorizado."},{status:401});
 try{
  const b=await request.json(); const productId=typeof b.product_id==="string"?b.product_id:""; const quantity=Number(b.quantity); const threshold=Number(b.low_stock_threshold);
  if(!productId||!Number.isInteger(quantity)||quantity<0||!Number.isInteger(threshold)||threshold<0)return NextResponse.json({error:"Cantidad o alerta inválida."},{status:400});
  const r=await fetch(`${c.url}/rest/v1/inventory?product_id=eq.${encodeURIComponent(productId)}`,{method:"PATCH",headers:{apikey:c.key,Authorization:`Bearer ${c.token}`,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({quantity,low_stock_threshold:threshold,updated_at:new Date().toISOString()}),cache:"no-store"});
  if(!r.ok)return NextResponse.json({error:"No se pudo actualizar el inventario."},{status:502});
  const rows=await r.json(); if(!rows.length)return NextResponse.json({error:"No se encontró el inventario."},{status:404});
  return NextResponse.json({success:true,inventory:rows[0]});
 }catch{return NextResponse.json({error:"No se pudo guardar."},{status:500});}
}