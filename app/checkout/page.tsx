"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/CartProvider";

type CheckoutForm = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fulfillmentMethod: "pickup" | "delivery";
  addressLine: string;
  city: string;
  postalCode: string;
  notes: string;
  website: string;
  acceptedTerms: boolean;
};

type OrderResult = {
  success?: boolean;
  orderReference?: string;
  subtotal?: number;
  error?: string;
};

function money(value: number) {
  return new Intl.NumberFormat("es-PR", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [form, setForm] = useState<CheckoutForm>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    fulfillmentMethod: "pickup",
    addressLine: "",
    city: "San Juan",
    postalCode: "",
    notes: "",
    website: "",
    acceptedTerms: false,
  });

  const update = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startedAt,
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });
      const payload = (await response.json()) as OrderResult;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "No pudimos enviar tu orden.");
      }

      clearCart();
      setResult(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos enviar tu orden."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-12">
        <section className="w-full max-w-xl rounded-[2rem] border border-green-100 bg-white p-8 text-center shadow-xl sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-11 w-11 text-green-600" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            Orden recibida
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            ¡Gracias por tu orden!
          </h1>
          <p className="mt-4 text-gray-600">
            La farmacia te llamará para confirmar disponibilidad, IVU, delivery y el total final antes de cobrar.
          </p>
          <div className="mt-7 rounded-2xl bg-gray-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Número de referencia
            </p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900">
              {result.orderReference}
            </p>
            {typeof result.subtotal === "number" && (
              <p className="mt-2 text-sm text-gray-600">
                Subtotal enviado: {money(result.subtotal)}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-green-600 px-7 py-3.5 text-sm font-bold text-white hover:bg-green-700"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <section className="w-full max-w-lg rounded-[2rem] border border-gray-200 bg-white p-10 text-center shadow-sm">
          <PackageCheck className="mx-auto h-12 w-12 text-gray-300" />
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
            Tu carrito está vacío
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Añade productos antes de continuar con tu orden.
          </p>
          <Link
            href="/#products"
            className="mt-6 inline-flex rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white"
          >
            Ver productos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <header className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="First Choice Pharmacy"
              width={150}
              height={50}
              className="h-11 w-auto object-contain"
            />
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al carrito
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="space-y-6">
          <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-wider text-green-700">
              Checkout seguro
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
              Completa tu orden
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Solo procesamos productos sin receta. No escribas medicamentos, diagnósticos ni números de receta en este formulario.
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field label="Nombre completo" required>
                <input
                  required
                  autoComplete="name"
                  maxLength={100}
                  value={form.customerName}
                  onChange={(event) => update("customerName", event.target.value)}
                  className="input-checkout"
                />
              </Field>
              <Field label="Teléfono" required>
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  maxLength={24}
                  placeholder="(787) 000-0000"
                  value={form.customerPhone}
                  onChange={(event) => update("customerPhone", event.target.value)}
                  className="input-checkout"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Correo electrónico (opcional)">
                  <input
                    type="email"
                    autoComplete="email"
                    maxLength={160}
                    value={form.customerEmail}
                    onChange={(event) => update("customerEmail", event.target.value)}
                    className="input-checkout"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-extrabold text-gray-900">
              ¿Cómo quieres recibirla?
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FulfillmentOption
                checked={form.fulfillmentMethod === "pickup"}
                icon={<Store className="h-5 w-5" />}
                title="Recogido"
                description="Te avisamos cuando esté lista."
                onChange={() => update("fulfillmentMethod", "pickup")}
              />
              <FulfillmentOption
                checked={form.fulfillmentMethod === "delivery"}
                icon={<Truck className="h-5 w-5" />}
                title="Delivery"
                description="Sujeto a área y tarifa."
                onChange={() => update("fulfillmentMethod", "delivery")}
              />
            </div>

            {form.fulfillmentMethod === "delivery" && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Dirección" required>
                    <input
                      required
                      autoComplete="street-address"
                      maxLength={120}
                      value={form.addressLine}
                      onChange={(event) => update("addressLine", event.target.value)}
                      className="input-checkout"
                    />
                  </Field>
                </div>
                <Field label="Municipio" required>
                  <input
                    required
                    autoComplete="address-level2"
                    maxLength={80}
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                    className="input-checkout"
                  />
                </Field>
                <Field label="Código postal" required>
                  <input
                    required
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={12}
                    value={form.postalCode}
                    onChange={(event) => update("postalCode", event.target.value)}
                    className="input-checkout"
                  />
                </Field>
              </div>
            )}

            <div className="mt-6">
              <Field label="Notas de la orden (opcional)">
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="Ej.: Llamar al llegar. No incluyas información médica."
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  className="input-checkout resize-none"
                />
              </Field>
            </div>

            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label>
                Sitio web
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(event) => update("website", event.target.value)}
                />
              </label>
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm text-gray-600">
              <input
                required
                type="checkbox"
                checked={form.acceptedTerms}
                onChange={(event) => update("acceptedTerms", event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 accent-green-600"
              />
              <span>
                Acepto los <Link href="/terminos" className="font-semibold text-green-700 underline">términos</Link> y la <Link href="/privacidad" className="font-semibold text-green-700 underline">política de privacidad</Link>.
              </span>
            </label>

            {error && (
              <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !form.acceptedTerms}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-4 text-base font-bold text-white shadow-lg hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Enviando orden..." : "Enviar orden a la farmacia"}
            </button>
          </section>
        </form>

        <aside className="h-fit rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <h2 className="text-lg font-extrabold text-gray-900">Resumen</h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="text-gray-600">
                  {item.quantity} × {item.name}
                </span>
                <span className="shrink-0 font-semibold text-gray-900">
                  {money(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="my-5 border-t border-gray-100" />
          <div className="flex justify-between text-lg font-extrabold text-gray-900">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            La farmacia confirmará disponibilidad, IVU, tarifa de delivery y total final.
          </p>

          <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm text-gray-600">
            <div className="flex gap-3">
              <CreditCard className="h-5 w-5 shrink-0 text-green-600" />
              <span>Pagas al recoger o recibir, después de confirmar.</span>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />
              <span>No solicitamos tarjeta ni datos de receta.</span>
            </div>
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-green-600" />
              <span>El delivery se confirma según tu ubicación.</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">
        {label}{required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function FulfillmentOption({
  checked,
  icon,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
        checked ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-200"
      }`}
    >
      <input
        type="radio"
        name="fulfillment"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className={`rounded-xl p-2 ${checked ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"}`}>
        {icon}
      </span>
      <span>
        <span className="block font-bold text-gray-900">{title}</span>
        <span className="mt-1 block text-xs text-gray-500">{description}</span>
      </span>
    </label>
  );
}
