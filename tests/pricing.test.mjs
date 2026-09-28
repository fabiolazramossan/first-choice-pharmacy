import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateTotals, pricingConfigFromEnv } from "../lib/pricing.ts";

const UNCONFIGURED = { ivuRate: null, deliveryFee: null, freeDeliveryThreshold: null };
// Test-only numbers; they are NOT business rates.
const CONFIGURED = { ivuRate: 0.1, deliveryFee: 5, freeDeliveryThreshold: 50 };

test("with no configuration nothing is invented: tax/fee/total stay pending", () => {
  const t = calculateTotals([{ unitPrice: 9.99, quantity: 2, taxable: true }], "delivery", UNCONFIGURED);
  assert.equal(t.subtotal, 19.98);
  assert.equal(t.tax, null);
  assert.equal(t.deliveryFee, null);
  assert.equal(t.total, null);
  assert.equal(t.pending.length, 2);
});

test("pickup never has a delivery fee", () => {
  const t = calculateTotals([{ unitPrice: 10, quantity: 1, taxable: false }], "pickup", CONFIGURED);
  assert.equal(t.deliveryFee, 0);
  assert.equal(t.tax, 0);
  assert.equal(t.total, 10);
  assert.deepEqual(t.pending, []);
});

test("tax applies only to taxable lines, in cents", () => {
  const t = calculateTotals(
    [
      { unitPrice: 0.1, quantity: 3, taxable: true },
      { unitPrice: 20, quantity: 1, taxable: false },
    ],
    "delivery",
    CONFIGURED
  );
  assert.equal(t.subtotal, 20.3);
  assert.equal(t.tax, 0.03);
  assert.equal(t.deliveryFee, 5);
  assert.equal(t.total, 25.33);
});

test("free delivery threshold is inclusive", () => {
  const t = calculateTotals([{ unitPrice: 50, quantity: 1, taxable: false }], "delivery", CONFIGURED);
  assert.equal(t.deliveryFee, 0);
});

test("unknown product taxability keeps IVU pending even when a rate exists", () => {
  const t = calculateTotals([{ unitPrice: 5, quantity: 1, taxable: null }], "pickup", CONFIGURED);
  assert.equal(t.tax, null);
  assert.equal(t.total, null);
  assert.match(t.pending[0], /clasificación/);
});

test("pricingConfigFromEnv defaults to unconfigured and rejects nonsense", () => {
  assert.deepEqual(pricingConfigFromEnv({}), UNCONFIGURED);
  assert.deepEqual(
    pricingConfigFromEnv({ IVU_RATE: "11.5", DELIVERY_FEE: "-3", FREE_DELIVERY_THRESHOLD: "abc" }),
    UNCONFIGURED,
    "a percentage instead of a fraction, a negative fee and text are all ignored"
  );
  assert.deepEqual(pricingConfigFromEnv({ IVU_RATE: "0.1", DELIVERY_FEE: "4.5", FREE_DELIVERY_THRESHOLD: "" }), {
    ivuRate: 0.1,
    deliveryFee: 4.5,
    freeDeliveryThreshold: null,
  });
});
