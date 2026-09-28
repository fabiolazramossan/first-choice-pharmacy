import { NextResponse } from "next/server";
import { getCartAvailability } from "@/lib/catalog";
import { isUuid } from "@/lib/server-security";
import { SupabaseRestError } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/catalog/cart?ids=<uuid>,<uuid>  (max 25; read-only, public data only)
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(",").filter(Boolean))];
  if (ids.length > 25 || !ids.every(isUuid)) {
    return NextResponse.json({ error: "Carrito inválido." }, { status: 400 });
  }
  try {
    return NextResponse.json(
      { items: await getCartAvailability(ids) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Cart availability failed", error instanceof SupabaseRestError ? error.status : "unknown");
    return NextResponse.json({ error: "No pudimos verificar el carrito." }, { status: 502 });
  }
}
