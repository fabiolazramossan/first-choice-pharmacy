// Server-only: records web orders through the create_order() database function
// (supabase/proposed/20260928120000_create_order_function.sql). The function is
// executable only by service_role, so this module needs SUPABASE_SECRET_KEY,
// which must never be exposed to the browser (no NEXT_PUBLIC_ prefix).

export type OrderCustomer = {
  name: string;
  phone: string;
  email: string | null;
  fulfillment_method: "pickup" | "delivery";
  delivery_address: { line1: string; city: string; postal_code: string } | null;
  notes: string | null;
};

export type CreatedOrder = {
  order_id: string;
  order_number: number;
  subtotal: number;
  items: { product_name: string; sku: string | null; unit_price: number; quantity: number; line_total: number }[];
};

export class OrderError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "OrderError";
  }
}

export function hasOrderDatabaseConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SECRET_KEY?.trim());
}

// Maps the function's error codes to customer-safe messages.
function orderErrorFromDatabase(message: string, detail: string | null): OrderError {
  switch (message) {
    case "PRODUCT_UNAVAILABLE":
      return new OrderError("Uno o más productos ya no están disponibles. Actualiza el carrito.", 409);
    case "INSUFFICIENT_STOCK":
      return new OrderError(
        `No hay suficiente inventario${detail ? ` de ${detail}` : ""}. Ajusta la cantidad en el carrito.`,
        409
      );
    case "INVALID_ADDRESS":
      return new OrderError("Completa la dirección de entrega.", 400);
    case "INVALID_NAME":
    case "INVALID_PHONE":
    case "INVALID_EMAIL":
    case "INVALID_FULFILLMENT":
    case "INVALID_NOTES":
    case "INVALID_CART":
    case "INVALID_QUANTITY":
      return new OrderError("Revisa los datos de la orden e intenta otra vez.", 400);
    default:
      return new OrderError("No se pudo registrar la orden.", 502);
  }
}

export async function createOrderRecord(
  customer: OrderCustomer,
  items: { product_id: string; quantity: number }[]
): Promise<CreatedOrder> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secretKey) {
    throw new OrderError("El servicio de órdenes no está disponible temporalmente.", 503);
  }

  const response = await fetch(new URL("/rest/v1/rpc/create_order", url), {
    method: "POST",
    headers: { apikey: secretKey, "Content-Type": "application/json" },
    body: JSON.stringify({ p_customer: customer, p_items: items }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string; details?: string } | null;
    console.error("create_order failed", response.status, error?.message ?? "unknown");
    throw orderErrorFromDatabase(error?.message ?? "", error?.details ?? null);
  }

  const order = (await response.json()) as CreatedOrder;
  return {
    ...order,
    subtotal: Number(order.subtotal),
    items: (order.items ?? []).map((item) => ({
      ...item,
      unit_price: Number(item.unit_price),
      line_total: Number(item.line_total),
    })),
  };
}
