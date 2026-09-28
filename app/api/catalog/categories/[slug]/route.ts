import { NextResponse } from "next/server";
import { hasSupabaseConfig, SupabaseRestError } from "@/lib/supabase";
import { getCategoryBySlug, parsePage, searchCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
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
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const searchParams = new URL(request.url).searchParams;
    const { products, total, page, pageCount } = await searchCatalog({
      categoryId: category.id,
      search: searchParams.get("q"),
      page: parsePage(searchParams.get("page")),
    });

    return NextResponse.json(
      { category, products, total, page, pageCount },
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
