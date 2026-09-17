import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  if (!/^[a-z0-9-]{1,80}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Catalog configuration is missing." },
      { status: 503 }
    );
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError) {
    console.error("Supabase category error:", categoryError.code);
    return NextResponse.json({ error: "Could not load category." }, { status: 502 });
  }

  if (!category) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  const { data, error: productsError } = await supabase
    .from("products")
    .select(
      "id,name,slug,brand,description,price,compare_at_price,image_url"
    )
    .eq("category_id", category.id)
    .eq("is_active", true)
    .eq("requires_prescription", false)
    .order("name", { ascending: true });

  if (productsError) {
    console.error("Supabase products error:", productsError.code);
    return NextResponse.json({ error: "Could not load products." }, { status: 502 });
  }

  const showTestProducts = process.env.VERCEL_ENV !== "production";
  const products = (data ?? []).filter(
    (product) => showTestProducts || !product.name.startsWith("[PRUEBA]")
  );

  return NextResponse.json(
    { category, products },
    { headers: { "Cache-Control": "no-store" } }
  );
}
