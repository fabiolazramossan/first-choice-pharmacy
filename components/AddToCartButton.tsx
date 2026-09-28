"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function AddToCartButton({
  product,
  disabled = false,
  quantity = 1,
  size = "sm",
}: {
  size?: "sm" | "lg";
  disabled?: boolean;
  quantity?: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url?: string | null;
  };
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={`mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-gray-200 font-bold text-gray-600 ${size === "lg" ? "py-3.5 text-sm" : "py-2.5 text-xs"}`}
      >
        Agotado
      </button>
    );
  }

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  const sizing = size === "lg" ? "py-3.5 text-sm" : "py-2.5 text-xs";
  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full font-bold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 ${sizing} ${
          added ? "bg-emerald-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        {added ? "Añadido ✓" : "Agregar al carrito"}
      </button>
      <span className="sr-only" role="status">
        {added ? `${product.name} añadido al carrito` : ""}
      </span>
    </>
  );
}
