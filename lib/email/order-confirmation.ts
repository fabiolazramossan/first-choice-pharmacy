import { escapeHtml } from "@/lib/server-security";
import type { OrderTotals } from "@/lib/pricing";

// Customer order confirmation email (Spanish). Building is pure and tested;
// sending is gated by CUSTOMER_EMAILS_ENABLED=true (off by default).
//
// Privacy: the email contains only what the customer typed at checkout and
// the OTC items ordered. No prescription or health information is collected
// by checkout, so none can appear here.

export type ConfirmationInput = {
  orderNumber: number | string;
  customerName: string;
  fulfillment: "pickup" | "delivery";
  items: { product_name: string; quantity: number; line_total: number }[];
  totals: OrderTotals;
  pharmacyPhone: string;
  pharmacyAddress: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("es-PR", { style: "currency", currency: "USD" }).format(value);

export function customerEmailsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.CUSTOMER_EMAILS_ENABLED === "true";
}

export function buildOrderConfirmationEmail(input: ConfirmationInput) {
  const { totals } = input;
  const reference = `#${input.orderNumber}`;
  const subject = `Recibimos tu orden ${reference} · First Choice Pharmacy`;
  const method = input.fulfillment === "delivery" ? "Delivery" : "Recogido en farmacia";
  const pendingNote = totals.pending.length
    ? `El total final se confirmará antes de cobrar (${totals.pending.join("; ")}).`
    : "";

  const summaryLines = [
    `Subtotal: ${money(totals.subtotal)}`,
    `IVU: ${totals.tax === null ? "a confirmar" : money(totals.tax)}`,
    ...(input.fulfillment === "delivery"
      ? [`Delivery: ${totals.deliveryFee === null ? "a confirmar" : money(totals.deliveryFee)}`]
      : []),
    `Total: ${totals.total === null ? "a confirmar" : money(totals.total)}`,
  ];

  const text = [
    `Hola ${input.customerName},`,
    "",
    `Recibimos tu orden ${reference} (${method}). La farmacia te llamará para confirmar disponibilidad y el total antes de cobrar.`,
    "",
    ...input.items.map((i) => `${i.quantity} × ${i.product_name} — ${money(i.line_total)}`),
    "",
    ...summaryLines,
    ...(pendingNote ? ["", pendingNote] : []),
    "",
    "Este mensaje no es una factura ni un recibo de pago.",
    `First Choice Pharmacy · ${input.pharmacyAddress} · ${input.pharmacyPhone}`,
  ].join("\n");

  const rows = input.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${i.quantity} × ${escapeHtml(i.product_name)}</td>` +
        `<td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${money(i.line_total)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111827;">
      <h2 style="color:#15803d;">¡Gracias por tu orden ${escapeHtml(reference)}!</h2>
      <p>Hola ${escapeHtml(input.customerName)},</p>
      <p>Recibimos tu orden (<strong>${escapeHtml(method)}</strong>). La farmacia te llamará para confirmar disponibilidad y el total antes de cobrar.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">${rows}</table>
      <p style="margin-top:12px;">${summaryLines.map(escapeHtml).join("<br>")}</p>
      ${pendingNote ? `<p style="color:#92400e;">${escapeHtml(pendingNote)}</p>` : ""}
      <p style="font-size:12px;color:#6b7280;margin-top:24px;">
        Este mensaje no es una factura ni un recibo de pago.<br>
        First Choice Pharmacy · ${escapeHtml(input.pharmacyAddress)} · ${escapeHtml(input.pharmacyPhone)}
      </p>
    </div>`;

  return { subject, text, html };
}
