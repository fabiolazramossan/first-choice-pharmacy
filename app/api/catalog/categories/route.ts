import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  selectFromSupabase,
  SupabaseRestError,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Catalog configuration is missing." },
      { status: 503 }
    );
  }

  try {
    const categories = await selectFromSupabase("categories", {
      select: "id,name,slug,description,sort_order",
      is_active: "eq.true",
      order: "sort_order.asc",
    });

    return NextResponse.json(
      { categories: categories ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "Catalog categories request failed:",
      error instanceof SupabaseRestError ? error.status : "unknown"
    );
    return NextResponse.json(
      { error: "Could not connect to catalog." },
      { status: 502 }
    );
  }
}
