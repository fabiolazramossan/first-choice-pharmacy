import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOrderConfirmationEmail, customerEmailsEnabled } from "../lib/email/order-confirmation.ts";

const base = {
  orderNumber: 1042,
  customerName: 'Ana <script>alert("x")</script>',
  fulfillment: "delivery",
  items: [{ product_name: "Tylenol <b>500</b>", quantity: 2, line_total: 19.98 }],
  totals: { subtotal: 19.98, tax: null, deliveryFee: null, total: null, pending: ["IVU a confirmar por la farmacia"] },
  pharmacyPhone: "787-751-6646",
  pharmacyAddress: "86 C. Georgetti, San Juan, PR 00926",
};

test("customer emails are off unless explicitly enabled", () => {
  assert.equal(customerEmailsEnabled({}), false);
  assert.equal(customerEmailsEnabled({ CUSTOMER_EMAILS_ENABLED: "1" }), false);
  assert.equal(customerEmailsEnabled({ CUSTOMER_EMAILS_ENABLED: "true" }), true);
});

test("HTML escapes customer and product text", () => {
  const { html } = buildOrderConfirmationEmail(base);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<b>500<\/b>/);
  assert.match(html, /&lt;script&gt;/);
});

test("unknown amounts say 'a confirmar' instead of inventing numbers", () => {
  const { text, subject } = buildOrderConfirmationEmail(base);
  assert.match(subject, /#1042/);
  assert.match(text, /IVU: a confirmar/);
  assert.match(text, /Delivery: a confirmar/);
  assert.match(text, /Total: a confirmar/);
  assert.match(text, /no es una factura/);
});

test("pickup orders omit the delivery line", () => {
  const { text } = buildOrderConfirmationEmail({
    ...base,
    fulfillment: "pickup",
    totals: { subtotal: 19.98, tax: 0, deliveryFee: 0, total: 19.98, pending: [] },
  });
  assert.doesNotMatch(text, /Delivery:/);
  assert.match(text, /Total: \$19\.98|Total: US\$19\.98|Total: 19\.98/);
});
