"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { PRODUCT_CATEGORIES, BRAND } from "@/lib/data";

export default function Products() {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <section id="products" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">Más de 800 productos</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-gray-900 sm:text-4xl">Nuestros Productos</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">Desde medicamentos hasta snacks, grocery y juguetes. Todo en un solo lugar.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {PRODUCT_CATEGORIES.map((cat, i) => (
            <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -6, scale: 1.02 }} onClick={() => setSelected(selected === i ? null : i)} className={`group relative cursor-pointer overflow-hidden rounded-3xl border bg-gradient-to-br ${cat.gradient} ${cat.border} p-5 shadow-sm hover:shadow-xl transition-all duration-300`}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md text-3xl group-hover:scale-110 transition-transform duration-300">{cat.emoji}</div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{cat.name}</h3>
                <p className="mt-1 text-xs text-gray-500 leading-snug">{cat.desc}</p>
              </div>
              {selected === i && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 border-t border-white/60 pt-3">
                  <p className="mb-2 text-xs font-bold text-gray-600 uppercase tracking-wide">Marcas disponibles:</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.items.map((item) => (<span key={item} className={`rounded-full ${cat.badge} px-2 py-0.5 text-[10px] font-semibold text-white`}>{item}</span>))}
                  </div>
                  <a href={BRAND.whatsappText} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-2 text-xs font-bold text-white hover:bg-[#1da851] transition-colors">Ordenar por WhatsApp</a>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-green-100 bg-green-50 p-8 text-center sm:flex-row sm:text-left">
          <div className="text-5xl">🛍️</div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">¿No encuentras lo que buscas?</h3>
            <p className="mt-1 text-sm text-gray-600">Escríbenos por WhatsApp y verificamos disponibilidad. Tenemos más de 800 productos.</p>
          </div>
          <a href={BRAND.whatsappText} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:bg-[#1da851] transition-colors shadow-lg">Consultar disponibilidad</a>
        </div>
      </div>
    </section>
  );
}
