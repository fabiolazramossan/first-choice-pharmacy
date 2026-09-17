import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  selectFromSupabase,
  SupabaseRestError,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  if (!/^[a-z0-9-]{1,80}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Catalog configuration is missing." },
      { status: 503 }
    );
  }

  try {
    const categories = await selectFromSupabase<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
    }>("categories", {
      select: "id,name,slug,description",
      slug: `eq.${slug}`,
      is_active: "eq.true",
      limit: "1",
    });
    const category = categories[0];

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const data = await selectFromSupabase<{
      id: string;
      name: string;
      slug: string;
      brand: string | null;
      description: string | null;
      price: number;
      compare_at_price: number | null;
      image_url: string | null;
    }>("products", {
      select: "id,name,slug,brand,description,price,compare_at_price,image_url",
      category_id: `eq.${category.id}`,
      is_active: "eq.true",
      requires_prescription: "eq.false",
      order: "name.asc",
    });

    const showTestProducts = process.env.VERCEL_ENV !== "production";
    const products = data.filter(
      (product) => showTestProducts || !product.name.startsWith("[PRUEBA]")
    );

    return NextResponse.json(
      { category, products },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "Catalog category request failed:",
      error instanceof SupabaseRestError ? error.status : "unknown"
    );
    return NextResponse.json({ error: "Could not load category." }, { status: 502 });
  }
}
