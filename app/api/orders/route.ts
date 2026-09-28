import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createOrderRecord, hasOrderDatabaseConfig, OrderError } from "@/lib/orders";
import { createRateLimiter } from "@/lib/rate-limit";
import { calculateTotals, pricingConfigFromEnv } from "@/lib/pricing";
import { buildOrderConfirmationEmail, customerEmailsEnabled } from "@/lib/email/order-confirmation";
import { BRAND } from "@/lib/data";
import {
  cleanText,
  escapeHtml,
  exceedsBodyLimit,
  getClientIp,
  isTrustedBrowserRequest,
  isValidEmail,
  isValidPhone,
  readJsonObject,
} from "@/lib/server-security";

export const runtime = "nodejs";

// Best-effort per-instance limits (see lib/rate-limit.ts).
const requestsByIp = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });
const requestsByPhone = createRateLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RequestedItem = { id: string; quantity: number };

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

  // Store-wide switch: online ordering stays closed until pricing and real
  // inventory are ready and ORDERS_ENABLED=true is set explicitly.
  if (process.env.ORDERS_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Las órdenes en línea aún no están disponibles. Llámanos o escríbenos por WhatsApp." },
      { status: 503 }
    );
  }

  if (exceedsBodyLimit(request, 24_000)) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  const ip = getClientIp(request);
  if (!requestsByIp.hit(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta nuevamente en 15 minutos." },
      { status: 429 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || !hasOrderDatabaseConfig()) {
    return NextResponse.json(
      { error: "El servicio de órdenes no está disponible temporalmente." },
      { status: 503 }
    );
  }

  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
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

    if (!requestsByPhone.hit(customerPhone.replace(/\D/g, ""))) {
      return NextResponse.json(
        { error: "Ya recibimos órdenes recientes para este teléfono. Llámanos si necesitas cambiarlas." },
        { status: 429 }
      );
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

    // The database function re-validates everything, locks stock, prices the
    // cart from the catalog and records the order atomically.
    const order = await createOrderRecord(
      {
        name: customerName,
        phone: customerPhone,
        email: customerEmail || null,
        fulfillment_method: fulfillmentMethod as "pickup" | "delivery",
        delivery_address:
          fulfillmentMethod === "delivery"
            ? { line1: addressLine, city, postal_code: postalCode }
            : null,
        notes: notes || null,
      },
      [...quantities].map(([product_id, quantity]) => ({ product_id, quantity }))
    );
    const reference = `#${order.order_number}`;
    const subtotal = order.subtotal;
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
    const itemRows = order.items
      .map(
        (item) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.product_name)}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${money(item.line_total)}</td>
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
      // The order is already recorded and visible in Admin → Órdenes, so the
      // customer still gets a confirmation; staff are alerted via logs.
      console.error("Resend order notification failed:", result.error.name, reference);
    }

    // Customer confirmation: off unless CUSTOMER_EMAILS_ENABLED=true, and never
    // fails the order. Product taxability is not stored yet, so IVU stays
    // "a confirmar" even if IVU_RATE is configured.
    const totals = calculateTotals(
      order.items.map((item) => ({ unitPrice: item.unit_price, quantity: item.quantity, taxable: null })),
      fulfillmentMethod as "pickup" | "delivery",
      pricingConfigFromEnv()
    );
    if (customerEmail && customerEmailsEnabled()) {
      const confirmation = buildOrderConfirmationEmail({
        orderNumber: order.order_number,
        customerName,
        fulfillment: fulfillmentMethod as "pickup" | "delivery",
        items: order.items,
        totals,
        pharmacyPhone: BRAND.phone,
        pharmacyAddress: BRAND.address,
      });
      const sent = await new Resend(resendApiKey).emails
        .send({ from: fromEmail, to: customerEmail, ...confirmation })
        .catch(() => null);
      if (!sent || sent.error) console.error("Customer confirmation email failed", reference);
    }

    return NextResponse.json({ success: true, orderReference: reference, subtotal, pending: totals.pending });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Order API error:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "No se pudo procesar la orden." }, { status: 500 });
  }
}
