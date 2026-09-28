import { NextResponse } from "next/server";
import { hasSupabaseConfig, SupabaseRestError } from "@/lib/supabase";
import { getActiveCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Catalog configuration is missing." },
      { status: 503 }
    );
  }

  try {
    const categories = await getActiveCategories();

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
