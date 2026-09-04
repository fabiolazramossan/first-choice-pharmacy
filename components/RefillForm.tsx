"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Send, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/data";

type Status = "idle" | "submitting" | "success" | "error";

export default function RefillForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ nombre: "", telefono: "", mensaje: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/refill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setForm({ nombre: "", telefono: "", mensaje: "" });
  };

  return (
    <section id="refill" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700">
              Smart Refill
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Solicita tu <span className="text-green-600">Refill</span>
            </h2>
            <p className="mt-3 font-semibold text-blue-600">Rápido, fácil y seguro.</p>
            <p className="mt-3 text-gray-500">
              Déjanos tu nombre y teléfono. Te llamamos para confirmar los detalles de tu receta de forma segura.
            </p>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <p className="text-sm text-green-800">
                <strong>Tu privacidad primero.</strong> Por tu seguridad, no pedimos números de receta ni información médica por internet. Verificamos todo por teléfono.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                "Te llamamos el mismo día",
                "Verificación segura por teléfono",
                "Opción de delivery disponible",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <h3 className="text-lg font-bold text-blue-900">Delivery &amp; Pickup</h3>
              <p className="mt-1 text-sm text-blue-700">Tú eliges cómo recibir tus medicamentos</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                {[
                  { e: "🛒", l: "1. Solicitas" },
                  { e: "📞", l: "2. Te llamamos" },
                  { e: "🚚", l: "3. Recibes" },
                ].map((s, i) => (
                  <div key={s.l} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow">
                        {s.e}
                      </div>
                      <span className="mt-1 text-xs font-semibold text-blue-800">{s.l}</span>
                    </div>
                    {i < 2 && <span className="text-lg font-bold text-blue-300">›</span>}
                  </div>
                ))}
              </div>
              <a
                href={BRAND.whatsappText}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center justify-center rounded-full bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Ordena ahora por WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-lg">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-gray-900">¡Gracias!</h3>
                  <p className="mt-2 max-w-xs text-gray-500">
                    Te llamaremos pronto para confirmar los detalles de tu receta.
                  </p>
                  <button
                    onClick={reset}
                    className="mt-8 rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold hover:bg-gray-50"
                  >
                    Enviar otra solicitud
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Nombre completo *
                    </label>
                    <input
                      required
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      type="text"
                      maxLength={100}
                      placeholder="Tu nombre"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-green-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Número de teléfono *
                    </label>
                    <input
                      required
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      type="tel"
                      maxLength={20}
                      placeholder="(787) 000-0000"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-green-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      name="mensaje"
                      value={form.mensaje}
                      onChange={handleChange}
                      maxLength={200}
                      rows={3}
                      placeholder="Ej: Necesito refill, prefiero delivery"
                      className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-green-400 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      No incluyas números de receta ni información médica.
                    </p>
                  </div>

                  {status === "error" && (
                    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                      Hubo un error. Intenta de nuevo o llámanos al {BRAND.phone}.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {status === "submitting" ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Solicitar Refill
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    Al enviar aceptas nuestra{" "}
                    <a href="/privacidad" className="underline hover:text-gray-600">
                      Política de Privacidad
                    </a>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}