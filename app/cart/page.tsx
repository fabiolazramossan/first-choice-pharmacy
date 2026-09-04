"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">Tu orden</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Carrito</h1>
          </div>
          <Link href="/#products" className="text-sm font-semibold text-green-700 hover:underline">
            Seguir comprando
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">Tu carrito está vacío</h2>
            <p className="mt-2 text-sm text-gray-500">Agrega productos para comenzar tu orden.</p>
            <Link href="/#products" className="mt-6 inline-flex rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="space-y-4">
              {items.map((item) => (
                <article key={item.id} className="flex gap-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-contain p-2" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-gray-300" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-gray-900">{item.name}</h2>
                        <p className="mt-1 text-sm font-semibold text-green-700">{money(item.price)}</p>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={`Eliminar ${item.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50" aria-label="Reducir cantidad">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50" aria-label="Aumentar cantidad">
                        <Plus className="h-4 w-4" />
                      </button>
                      <span className="ml-auto text-sm font-extrabold text-gray-900">{money(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </article>
              ))}

              <button type="button" onClick={clearCart} className="text-sm font-semibold text-gray-500 hover:text-red-600">
                Vaciar carrito
              </button>
            </section>

            <aside className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-lg font-extrabold text-gray-900">Resumen</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="flex justify-between text-gray-500"><span>IVU / impuestos</span><span>Se calculará al pagar</span></div>
                <div className="flex justify-between text-gray-500"><span>Delivery</span><span>Se calculará al pagar</span></div>
              </div>
              <div className="my-5 border-t border-gray-100" />
              <div className="flex justify-between text-lg font-extrabold text-gray-900"><span>Total estimado</span><span>{money(subtotal)}</span></div>

              <button type="button" disabled className="mt-6 w-full cursor-not-allowed rounded-full bg-gray-300 py-3.5 text-sm font-bold text-white">
                Checkout próximamente
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">El próximo paso conectará Stripe y pickup/delivery.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
