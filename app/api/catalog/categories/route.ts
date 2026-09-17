import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Catalog configuration is missing." },
      { status: 503 }
    );
  }

  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id,name,slug,description,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Supabase categories error:", error.code);
      return NextResponse.json(
        { error: "Could not load categories." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { categories: categories ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Catalog categories request failed.");
    return NextResponse.json(
      { error: "Could not connect to catalog." },
      { status: 502 }
    );
  }
}
