import { NextResponse } from "next/server";
import { adminHeaders, requireAdmin } from "@/lib/admin-auth";
import { cleanText, isUuid, readJsonObject } from "@/lib/server-security";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readFields(body: Record<string, unknown>) {
  const sortOrder = Number(body.sort_order);
  return {
    name: cleanText(body.name, 80),
    description: cleanText(body.description, 200) || null,
    sort_order: Number.isInteger(sortOrder) && sortOrder >= 0 && sortOrder <= 10_000 ? sortOrder : 0,
    is_active: body.is_active === true,
  };
}

// Lists every category (active and inactive) with its product count.
export async function GET() {
  const { ctx, error } = await requireAdmin();
  if (error) return error;
  const r = await fetch(
    `${ctx.url}/rest/v1/categories?select=id,name,slug,description,sort_order,is_active,products(count)&order=sort_order.asc,name.asc`,
    { headers: adminHeaders(ctx), cache: "no-store" }
  );
  if (!r.ok) return NextResponse.json({ error: "No se pudieron cargar las categorías." }, { status: 502 });
  const rows = (await r.json()) as (Record<string, unknown> & { products?: { count: number }[] })[];
  return NextResponse.json({
    categories: rows.map(({ products, ...category }) => ({ ...category, product_count: products?.[0]?.count ?? 0 })),
  });
}

export async function POST(request: Request) {
  const { ctx, error } = await requireAdmin(request);
  if (error) return error;
  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
    const fields = readFields(body);
    const slug = typeof body.slug === "string" && body.slug.trim() ? body.slug.trim().toLowerCase() : slugify(fields.name);
    if (fields.name.length < 2 || !SLUG.test(slug) || slug.length > 80) {
      return NextResponse.json({ error: "Escribe un nombre (y un identificador URL con letras, números y guiones)." }, { status: 400 });
    }
    const r = await fetch(`${ctx.url}/rest/v1/categories`, {
      method: "POST",
      headers: adminHeaders(ctx, true),
      body: JSON.stringify({ ...fields, slug }),
      cache: "no-store",
    });
    if (!r.ok) {
      console.error("Admin category create failed", r.status);
      const duplicate = r.status === 409;
      return NextResponse.json(
        { error: duplicate ? "Ya existe una categoría con ese identificador URL." : "No se pudo crear la categoría." },
        { status: duplicate ? 409 : 502 }
      );
    }
    return NextResponse.json({ success: true, category: (await r.json())[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la categoría." }, { status: 500 });
  }
}

// Slugs are public URLs (and in the sitemap), so they are not editable here.
export async function PATCH(request: Request) {
  const { ctx, error } = await requireAdmin(request);
  if (error) return error;
  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
    const id = isUuid(body.id) ? body.id : "";
    const fields = readFields(body);
    if (!id || fields.name.length < 2) {
      return NextResponse.json({ error: "Datos de la categoría inválidos." }, { status: 400 });
    }
    const r = await fetch(`${ctx.url}/rest/v1/categories?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: adminHeaders(ctx, true),
      body: JSON.stringify(fields),
      cache: "no-store",
    });
    if (!r.ok) {
      console.error("Admin category update failed", r.status);
      return NextResponse.json({ error: "No se pudo actualizar la categoría." }, { status: 502 });
    }
    const rows = await r.json();
    if (!rows.length) {
      return NextResponse.json({ error: "No se encontró la categoría o no tienes permiso para editarla." }, { status: 404 });
    }
    return NextResponse.json({ success: true, category: rows[0] });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la categoría." }, { status: 500 });
  }
}
