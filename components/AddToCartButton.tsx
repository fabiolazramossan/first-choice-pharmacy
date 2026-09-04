"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function AddToCartButton({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url?: string | null;
  };
}) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-2.5 text-xs font-bold text-white transition hover:bg-green-700"
    >
      <ShoppingCart className="h-4 w-4" />
      Agregar al carrito
    </button>
  );
}
