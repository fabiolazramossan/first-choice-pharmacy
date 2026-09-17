import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  hasSupabaseConfig,
  selectFromSupabase,
  SupabaseRestError,
} from "@/lib/supabase";
import {
  cleanText,
  escapeHtml,
  exceedsBodyLimit,
  getClientIp,
  isTrustedBrowserRequest,
  isValidEmail,
  isValidPhone,
} from "@/lib/server-security";

export const runtime = "nodejs";

const requests = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RequestedItem = { id: string; quantity: number };

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= LIMIT) return false;
  entry.count += 1;
  return true;
}

function orderReference(): string {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `FC-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function money(value: number): string {
  return new Intl.NumberFormat("es-PR", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export async function POST(request: Request) {
  if (!isTrustedBrowserRequest(request)) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }

  if (exceedsBodyLimit(request, 24_000)) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta nuevamente en 15 minutos." },
      { status: 429 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || !hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "El servicio de órdenes no está disponible temporalmente." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const customerName = cleanText(body.customerName, 100);
    const customerPhone = cleanText(body.customerPhone, 24);
    const customerEmail = cleanText(body.customerEmail, 160).toLowerCase();
    const fulfillmentMethod = cleanText(body.fulfillmentMethod, 20);
    const addressLine = cleanText(body.addressLine, 120);
    const city = cleanText(body.city, 80);
    const postalCode = cleanText(body.postalCode, 12);
    const notes = cleanText(body.notes, 300);
    const honeypot = cleanText(body.website, 80);
    const startedAt = Number(body.startedAt);

    if (honeypot) {
      return NextResponse.json({ success: true, orderReference: "RECIBIDA" });
    }

    if (
      !Number.isFinite(startedAt) ||
      Date.now() - startedAt < 2_000 ||
      Date.now() - startedAt > 60 * 60 * 1000
    ) {
      return NextResponse.json({ error: "Actualiza la página e intenta otra vez." }, { status: 400 });
    }

    if (customerName.length < 2) {
      return NextResponse.json({ error: "Escribe tu nombre completo." }, { status: 400 });
    }
    if (!isValidPhone(customerPhone)) {
      return NextResponse.json({ error: "Escribe un teléfono válido." }, { status: 400 });
    }
    if (customerEmail && !isValidEmail(customerEmail)) {
      return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
    }
    if (!["pickup", "delivery"].includes(fulfillmentMethod)) {
      return NextResponse.json({ error: "Selecciona recogido o delivery." }, { status: 400 });
    }
    if (body.acceptedTerms !== true) {
      return NextResponse.json({ error: "Debes aceptar los términos." }, { status: 400 });
    }
    if (
      fulfillmentMethod === "delivery" &&
      (addressLine.length < 5 || city.length < 2 || postalCode.length < 5)
    ) {
      return NextResponse.json({ error: "Completa la dirección de entrega." }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 25) {
      return NextResponse.json({ error: "El carrito no es válido." }, { status: 400 });
    }

    const quantities = new Map<string, number>();
    for (const rawItem of body.items as RequestedItem[]) {
      const id = cleanText(rawItem?.id, 36);
      const quantity = Number(rawItem?.quantity);
      if (!UUID_PATTERN.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return NextResponse.json({ error: "Hay un producto inválido en el carrito." }, { status: 400 });
      }
      quantities.set(id, (quantities.get(id) ?? 0) + quantity);
    }

    if ([...quantities.values()].some((quantity) => quantity > 10)) {
      return NextResponse.json({ error: "La cantidad máxima por producto es 10." }, { status: 400 });
    }

    const ids = [...quantities.keys()];
    const products = await selectFromSupabase<{
      id: string;
      name: string;
      sku: string | null;
      price: number;
    }>("products", {
      select: "id,name,sku,price",
      id: `in.(${ids.join(",")})`,
      is_active: "eq.true",
      requires_prescription: "eq.false",
    });

    const available = new Map(products.map((product) => [product.id, product]));
    const production = process.env.VERCEL_ENV === "production";

    if (
      available.size !== ids.length ||
      (production && [...available.values()].some((product) => product.name.startsWith("[PRUEBA]")))
    ) {
      return NextResponse.json(
        { error: "Uno o más productos ya no están disponibles. Actualiza el carrito." },
        { status: 409 }
      );
    }

    const lineItems = ids.map((id) => {
      const product = available.get(id)!;
      const quantity = quantities.get(id)!;
      const unitPrice = Number(product.price);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error("Invalid catalog price");
      }
      return {
        id,
        name: product.name,
        sku: product.sku,
        quantity,
        unitPrice,
        lineTotal: Math.round(unitPrice * 100) * quantity / 100,
      };
    });

    const subtotalCents = lineItems.reduce(
      (sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity,
      0
    );
    const subtotal = subtotalCents / 100;
    const reference = orderReference();
    const pharmacyEmail = process.env.PHARMACY_EMAIL || "firstpharmacy.3pr@gmail.com";
    const fromEmail =
      process.env.ORDER_FROM_EMAIL || "First Choice Pharmacy <onboarding@resend.dev>";

    const safeName = escapeHtml(customerName);
    const safePhone = escapeHtml(customerPhone);
    const safeEmail = escapeHtml(customerEmail || "No provisto");
    const safeNotes = escapeHtml(notes || "Ninguna");
    const safeAddress = escapeHtml(
      fulfillmentMethod === "delivery"
        ? `${addressLine}, ${city}, PR ${postalCode}`
        : "Recogido en farmacia"
    );
    const itemRows = lineItems
      .map(
        (item) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${money(item.lineTotal)}</td>
          </tr>`
      )
      .join("");

    const result = await new Resend(resendApiKey).emails.send({
      from: fromEmail,
      to: pharmacyEmail,
      subject: `Nueva orden ${reference}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111827;">
          <h2 style="color:#15803d;">Nueva orden ${reference}</h2>
          <p><strong>Cliente:</strong> ${safeName}</p>
          <p><strong>Teléfono:</strong> ${safePhone}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Método:</strong> ${fulfillmentMethod === "delivery" ? "Delivery" : "Recogido"}</p>
          <p><strong>Dirección:</strong> ${safeAddress}</p>
          <table style="width:100%;border-collapse:collapse;margin-top:18px;">
            <thead><tr><th style="padding:8px;text-align:left;">Producto</th><th style="padding:8px;">Cant.</th><th style="padding:8px;text-align:right;">Total</th></tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <p style="font-size:18px;"><strong>Subtotal: ${money(subtotal)}</strong></p>
          <p><strong>Notas:</strong> ${safeNotes}</p>
          <div style="margin-top:20px;padding:14px;background:#fef3c7;border-radius:8px;color:#92400e;font-size:13px;">
            Confirmar disponibilidad, IVU y cargo de delivery antes de cobrar. Esta orden no contiene medicamentos con receta.
          </div>
        </div>`,
    });

    if (result.error) {
      console.error("Resend order error:", result.error.name);
      return NextResponse.json({ error: "No se pudo enviar la orden." }, { status: 502 });
    }

    return NextResponse.json({ success: true, orderReference: reference, subtotal });
  } catch (error) {
    console.error(
      "Order API error:",
      error instanceof SupabaseRestError ? error.status : "unknown"
    );
    if (error instanceof SupabaseRestError) {
      return NextResponse.json(
        { error: "No pudimos validar el carrito." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "No se pudo procesar la orden." }, { status: 500 });
  }
}
