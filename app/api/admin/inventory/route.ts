import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(){
 const {ctx:c,error}=await requireAdmin(); if(error)return error;
 const r=await fetch(`${c.url}/rest/v1/inventory?select=product_id,quantity,low_stock_threshold,updated_at,products(id,name,brand,sku,upc,is_active)&order=quantity.asc&limit=1000`,{headers:{apikey:c.key,Authorization:`Bearer ${c.token}`},cache:"no-store"});
 if(!r.ok)return NextResponse.json({error:"No se pudo cargar el inventario."},{status:502});
 return NextResponse.json({inventory:await r.json()});
}
export async function PATCH(request:Request){
 const {ctx:c,error}=await requireAdmin(request); if(error)return error;
 try{
  const b=await request.json(); const productId=typeof b.product_id==="string"?b.product_id:""; const quantity=Number(b.quantity); const threshold=Number(b.low_stock_threshold); const expected=Number(b.expected_quantity);
  if(!productId||!Number.isInteger(quantity)||quantity<0||!Number.isInteger(threshold)||threshold<0)return NextResponse.json({error:"Cantidad o alerta inválida."},{status:400});
  // Optimistic concurrency: only apply if stock still equals what the admin saw.
  const guard=Number.isInteger(expected)&&expected>=0?`&quantity=eq.${expected}`:"";
  const r=await fetch(`${c.url}/rest/v1/inventory?product_id=eq.${encodeURIComponent(productId)}${guard}`,{method:"PATCH",headers:{apikey:c.key,Authorization:`Bearer ${c.token}`,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({quantity,low_stock_threshold:threshold,updated_at:new Date().toISOString()}),cache:"no-store"});
  if(!r.ok)return NextResponse.json({error:"No se pudo actualizar el inventario."},{status:502});
  const rows=await r.json(); if(!rows.length)return guard?NextResponse.json({error:"El inventario cambió mientras editabas. Recarga y vuelve a intentarlo."},{status:409}):NextResponse.json({error:"No se encontró el inventario."},{status:404});
  return NextResponse.json({success:true,inventory:rows[0]});
 }catch{return NextResponse.json({error:"No se pudo guardar."},{status:500});}
}