"use client";

import { useId, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";

type Props = {
  product: { id: string; name: string; slug: string; price: number; image_url: string | null };
  /** min(stock, 10); 0 = sold out */
  maxQuantity: number;
};

export default function ProductPurchase({ product, maxQuantity }: Props) {
  const [quantity, setQuantity] = useState(1);
  const id = useId();

  if (maxQuantity < 1) {
    return <AddToCartButton product={product} disabled size="lg" />;
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-800">
        Cantidad
      </label>
      <select
        id={id}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="mt-2 w-28 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/30"
      >
        {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      {maxQuantity < 10 && <p className="mt-2 text-xs text-gray-600">Máximo por orden: {maxQuantity}</p>}
      <AddToCartButton product={product} quantity={quantity} size="lg" />
    </div>
  );
}
