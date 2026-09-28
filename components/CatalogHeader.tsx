"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function CatalogHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-4 py-3 shadow-sm sm:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <Link href="/" aria-label="First Choice Pharmacy, ir al inicio">
          <Image src="/logo.png" alt="" width={140} height={46} className="h-10 w-auto object-contain sm:h-11" />
        </Link>
        <nav aria-label="Catálogo" className="flex items-center gap-3 sm:gap-4">
          <Link href="/productos" className="py-2.5 text-sm font-semibold text-green-700 hover:underline">
            Todos los productos
          </Link>
          <Link
            href="/cart"
            aria-label={itemCount > 0 ? `Carrito, ${itemCount} artículos` : "Carrito"}
            className="relative flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Carrito</span>
            {itemCount > 0 && (
              <span
                aria-hidden="true"
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] text-green-700"
              >
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
