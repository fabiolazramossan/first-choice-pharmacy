// Order totals: subtotal, IVU (Puerto Rico sales tax) and delivery fee.
//
// NO RATES ARE HARD-CODED. Every business rule comes from configuration that
// the pharmacy (and its accountant) must provide. Anything not configured is
// reported as "pending" and the total is left for the pharmacy to confirm,
// which matches today's process (staff confirm IVU and delivery by phone).
//
// All money math is done in integer cents to avoid floating-point drift.

export type PricingConfig = {
  /** IVU as a fraction (e.g. 0.07 for 7%). null = not configured. */
  ivuRate: number | null;
  /** Flat delivery fee in dollars. null = not configured. */
  deliveryFee: number | null;
  /** Subtotal (dollars) at or above which delivery is free. null = never free. */
  freeDeliveryThreshold: number | null;
};

export type PricedLine = {
  unitPrice: number;
  quantity: number;
  /**
   * Whether IVU applies to this product. null = unknown. Taxability of OTC
   * medicines and other categories must be confirmed by the accountant and
   * stored per product before tax can be calculated automatically.
   */
  taxable: boolean | null;
};

export type OrderTotals = {
  subtotal: number;
  tax: number | null;
  deliveryFee: number | null;
  total: number | null;
  /** Human-readable reasons the total is not final (Spanish, customer-safe). */
  pending: string[];
};

const toCents = (dollars: number) => Math.round(dollars * 100);
const toDollars = (cents: number) => cents / 100;

function validRate(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value >= 0 && value < 1 ? value : null;
}
function validMoney(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value >= 0 ? value : null;
}

function readNumber(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * Reads pricing settings from server-only environment variables. All are
 * unset by default. (A future admin "Configuración" screen can move these to
 * a database table without changing calculateTotals.)
 */
export function pricingConfigFromEnv(env: Record<string, string | undefined> = process.env): PricingConfig {
  return {
    ivuRate: validRate(readNumber(env.IVU_RATE)),
    deliveryFee: validMoney(readNumber(env.DELIVERY_FEE)),
    freeDeliveryThreshold: validMoney(readNumber(env.FREE_DELIVERY_THRESHOLD)),
  };
}

export function calculateTotals(
  lines: PricedLine[],
  fulfillment: "pickup" | "delivery",
  config: PricingConfig
): OrderTotals {
  const pending: string[] = [];
  const subtotalCents = lines.reduce((sum, l) => sum + toCents(l.unitPrice) * l.quantity, 0);

  // IVU
  let taxCents: number | null = null;
  const ivuRate = validRate(config.ivuRate);
  if (ivuRate === null) {
    pending.push("IVU a confirmar por la farmacia");
  } else if (lines.some((l) => l.taxable === null)) {
    pending.push("IVU a confirmar: hay productos sin clasificación de impuesto");
  } else {
    const taxableCents = lines
      .filter((l) => l.taxable)
      .reduce((sum, l) => sum + toCents(l.unitPrice) * l.quantity, 0);
    taxCents = Math.round(taxableCents * ivuRate);
  }

  // Delivery
  let deliveryCents: number | null = 0;
  if (fulfillment === "delivery") {
    const threshold = validMoney(config.freeDeliveryThreshold);
    const fee = validMoney(config.deliveryFee);
    if (threshold !== null && subtotalCents >= toCents(threshold)) {
      deliveryCents = 0;
    } else if (fee === null) {
      deliveryCents = null;
      pending.push("Cargo de delivery a confirmar por la farmacia");
    } else {
      deliveryCents = toCents(fee);
    }
  }

  const total =
    taxCents === null || deliveryCents === null ? null : toDollars(subtotalCents + taxCents + deliveryCents);

  return {
    subtotal: toDollars(subtotalCents),
    tax: taxCents === null ? null : toDollars(taxCents),
    deliveryFee: deliveryCents === null ? null : toDollars(deliveryCents),
    total,
    pending,
  };
}
