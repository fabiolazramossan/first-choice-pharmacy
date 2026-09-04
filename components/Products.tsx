"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/data";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

const categoryEmoji: Record<string, string> = {
  "medicamentos-otc": "💊",
  "vitaminas-suplementos": "🌿",
  "primeros-auxilios": "🩹",
  "equipo-medico": "🏥",
  "dolor-muscular": "💪",
  "salud-ocular-nasal": "👁️",
  "bebe-mama": "👶",
  "vitaminas-infantiles": "🧸",
  "productos-naturales": "🌱",
  "grocery-alimentos": "🛒",
  "leches-bebidas": "🥛",
  "snacks-dulces": "🍿",
  "refrescos-agua": "🥤",
  "juguetes-regalos": "🎁",
};

export default function Products() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const response = await fetch("/api/catalog/categories", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Catalog request failed: ${response.status}`);
        }

        const payload = (await response.json()) as { categories?: Category[] };

        if (!mounted) return;
        setCategories(payload.categories ?? []);
      } catch (err) {
        console.error("Could not load categories", err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="products" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
            Catálogo en línea
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Nuestros Productos
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Explora nuestras categorías y consulta los productos disponibles.
          </p>
        </div>

        {loading && (
          <div className="py-12 text-center text-sm font-medium text-gray-500">
            Cargando categorías...
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="font-semibold text-amber-900">
              El catálogo no está disponible en este momento.
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Puedes consultarnos directamente por WhatsApp.
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => router.push(`/productos/${cat.slug}`)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm transition-all duration-300 hover:border-green-200 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-md transition-transform duration-300 group-hover:scale-110">
                    {categoryEmoji[cat.slug] ?? "🛍️"}
                  </div>
                  <h3 className="text-sm font-bold leading-tight text-gray-900">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs leading-snug text-gray-500">
                    {cat.description ?? "Ver productos disponibles"}
                  </p>
                  <span className="mt-3 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 opacity-0 transition-opacity group-hover:opacity-100">
                    Ver productos
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-green-100 bg-green-50 p-8 text-center sm:flex-row sm:text-left">
          <div className="text-5xl">🛍️</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Escríbenos y verificamos disponibilidad en tienda.
            </p>
          </div>
          <a
            href={BRAND.whatsappText}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#1da851]"
          >
            Consultar disponibilidad
          </a>
        </div>
      </div>
    </section>
  );
}
