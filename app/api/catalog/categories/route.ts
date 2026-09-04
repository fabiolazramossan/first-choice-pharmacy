import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: "Catalog configuration is missing." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `${url}/rest/v1/categories?select=id,name,slug,description,sort_order&is_active=eq.true&order=sort_order.asc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const details = await response.text();
      console.error("Supabase categories error:", response.status, details);
      return NextResponse.json(
        { error: "Could not load categories." },
        { status: 502 }
      );
    }

    const categories = await response.json();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Catalog categories request failed:", error);
    return NextResponse.json(
      { error: "Could not connect to catalog." },
      { status: 502 }
    );
  }
}
