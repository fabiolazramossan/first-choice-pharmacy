import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

// Rendered per request so the ORDERS_ENABLED switch (server-only) is read at
// runtime; the value itself never reaches the browser beyond this boolean.
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return <CheckoutForm ordersEnabled={process.env.ORDERS_ENABLED === "true"} />;
}
