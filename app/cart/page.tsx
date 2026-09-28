"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import CatalogHeader from "@/components/CatalogHeader";
import { useCart } from "@/components/CartProvider";
import { useCartAvailability } from "@/hooks/useCartAvailability";
import { formatMoney } from "@/lib/catalog-display";

export default function CartPage() {
  const { items, hydrated, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { status, available, unavailableCount } = useCartAvailability();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader />
      <main id="contenido" className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-green-700">Tu orden</p>
              <h1 className="text-3xl font-extrabold text-gray-900">Carrito</h1>
            </div>
            <Link href="/productos" className="py-2.5 text-sm font-semibold text-green-700 hover:underline">
              Seguir comprando
            </Link>
          </div>

          {!hydrated ? (
            <p role="status" className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-600">
              Cargando tu carrito…
            </p>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm sm:p-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold text-gray-900">Tu carrito está vacío</h2>
              <p className="mt-2 text-sm text-gray-600">Busca productos o explora nuestras categorías.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/productos" className="inline-flex justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700">
                  Ver productos
                </Link>
                <Link href="/#products" className="inline-flex justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-bold text-gray-800 hover:border-green-600">
                  Ver categorías
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section aria-label="Productos en el carrito" className="space-y-4">
                {status === "checking" && (
                  <p role="status" className="text-sm text-gray-600">Verificando precios y disponibilidad…</p>
                )}
                {status === "error" && (
                  <p role="status" className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
                    No pudimos verificar precios y disponibilidad ahora. Se confirmarán antes de procesar tu orden.
                  </p>
                )}
                <ul className="space-y-4">
                  {items.map((item) => {
                    const max = available?.[item.id];
                    const unavailable = max === 0;
                    return (
                      <li key={item.id} className={`flex gap-3 rounded-3xl border bg-white p-3 shadow-sm sm:gap-4 sm:p-4 ${unavailable ? "border-red-200" : "border-gray-200"}`}>
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 sm:h-24 sm:w-24">
                          {item.image_url ? (
                            <Image src={item.image_url} alt="" width={96} height={96} className="h-full w-full object-contain p-2" />
                          ) : (
                            <ShoppingBag className="h-8 w-8 text-gray-300" aria-hidden="true" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h2 className="font-bold text-gray-900">
                                <Link href={`/producto/${item.slug}`} className="inline-block py-0.5 hover:text-green-700 hover:underline">{item.name}</Link>
                              </h2>
                              <p className="mt-1 text-sm font-semibold text-green-700">{formatMoney(item.price)}</p>
                              {unavailable && (
                                <p role="alert" className="mt-1 text-xs font-semibold text-red-700">
                                  No disponible en este momento. Elimínalo para continuar.
                                </p>
                              )}
                              {max !== undefined && max > 0 && item.quantity >= max && max < 10 && (
                                <p className="mt-1 text-xs text-gray-600">Máximo disponible: {max}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Eliminar ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50"
                              aria-label={item.quantity === 1 ? `Eliminar ${item.name}` : `Reducir cantidad de ${item.name}`}
                            >
                              <Minus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-bold text-gray-900" aria-label={`Cantidad: ${item.quantity}`}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= (max ?? 10) || unavailable}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Aumentar cantidad de ${item.name}`}
                            >
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="ml-auto text-sm font-extrabold text-gray-900">{formatMoney(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {confirmClear ? (
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm" role="group" aria-label="Confirmar vaciar carrito">
                    <span className="text-red-800">¿Vaciar todo el carrito?</span>
                    <button type="button" onClick={() => { clearCart(); setConfirmClear(false); }} className="rounded-full bg-red-600 px-4 py-2 font-semibold text-white">
                      Sí, vaciar
                    </button>
                    <button type="button" onClick={() => setConfirmClear(false)} className="rounded-full border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-800">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmClear(true)} className="py-2 text-sm font-semibold text-gray-600 hover:text-red-600">
                    Vaciar carrito
                  </button>
                )}
              </section>

              <aside aria-label="Resumen de la orden" className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                <h2 className="text-lg font-extrabold text-gray-900">Resumen</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-700"><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
                  <div className="flex justify-between gap-4 text-gray-600"><dt>IVU</dt><dd className="text-right">A confirmar por la farmacia</dd></div>
                  <div className="flex justify-between gap-4 text-gray-600"><dt>Delivery</dt><dd className="text-right">Según área, si aplica</dd></div>
                </dl>
                <div className="my-5 border-t border-gray-100" />
                <div className="flex justify-between text-lg font-extrabold text-gray-900"><span>Subtotal estimado</span><span>{formatMoney(subtotal)}</span></div>

                {unavailableCount > 0 ? (
                  <p role="status" className="mt-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-semibold text-red-700">
                    Elimina {unavailableCount === 1 ? "el producto no disponible" : `los ${unavailableCount} productos no disponibles`} para continuar.
                  </p>
                ) : (
                  <Link href="/checkout" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-3.5 text-sm font-bold text-white hover:bg-green-700">
                    Continuar la orden <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
                <p className="mt-3 text-center text-xs leading-relaxed text-gray-600">
                  No cobramos tu tarjeta en esta etapa. La farmacia confirma disponibilidad y el total antes del pago.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
