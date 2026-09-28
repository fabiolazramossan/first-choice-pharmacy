"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function AddToCartButton({
  product,
  disabled = false,
}: {
  disabled?: boolean;
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
        className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-gray-200 py-2.5 text-xs font-bold text-gray-600"
      >
        Agotado
      </button>
    );
  }

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-white transition ${
        added ? "bg-emerald-700" : "bg-green-600 hover:bg-green-700"
      }`}
      aria-live="polite"
    >
      <ShoppingCart className="h-4 w-4" />
      {added ? "Añadido ✓" : "Agregar al carrito"}
    </button>
  );
}
