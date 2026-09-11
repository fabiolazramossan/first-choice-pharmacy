"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
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

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function CategoriaPage() {
  const params = useParams<{ categoria: string }>();
  const categoria = params?.categoria;
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCategory() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!url || !key || !categoria) {
        if (mounted) {
          setError(true);
          setLoading(false);
        }
        return;
      }

      try {
        const categoryResponse = await fetch(
          `${url}/rest/v1/categories?select=id,name,slug,description&slug=eq.${encodeURIComponent(categoria)}&is_active=eq.true&limit=1`,
          { headers: { apikey: key }, cache: "no-store" }
        );

        if (!categoryResponse.ok) {
          throw new Error(`Category request failed: ${categoryResponse.status}`);
        }

        const categoryData = (await categoryResponse.json()) as Category[];
        const found = categoryData[0];
        if (!found) throw new Error("Category not found");

        const productsResponse = await fetch(
          `${url}/rest/v1/products?select=id,name,slug,brand,description,price,compare_at_price,image_url&category_id=eq.${found.id}&is_active=eq.true&requires_prescription=eq.false&order=name.asc`,
          { headers: { apikey: key }, cache: "no-store" }
        );

        if (!productsResponse.ok) {
          throw new Error(`Products request failed: ${productsResponse.status}`);
        }

        const productData = (await productsResponse.json()) as Product[];
        if (!mounted) return;
        setCategory(found);
        setProducts(productData);
      } catch (err) {
        console.error("Could not load category products", err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCategory();

    return () => {
      mounted = false;
    };
  }, [categoria]);

  if (loading) {
    return <div className="min-h-screen bg-white p-10 text-center text-gray-500">Cargando productos...</div>;
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-white p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900">No pudimos cargar esta categoría</h1>
        <Link href="/#products" className="mt-4 inline-block font-semibold text-green-600 hover:underline">
          Volver a productos
        </Link>
      </div>
    );
  }

  const emoji = categoryEmoji[category.slug] ?? "🛍️";
  const wa =
    "https://wa.me/17877516646?text=" +
    encodeURIComponent(`Hola, quisiera información sobre ${category.name}`);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/">
            <Image src="/logo.png" alt="First Choice Pharmacy" width={140} height={46} className="h-11 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/#products" className="text-sm font-semibold text-green-600 hover:underline">
              Volver a productos
            </Link>
            <Link href="/cart" className="rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700">
              Ver carrito
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <span className="text-4xl">{emoji}</span>
          <h1 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">{category.name}</h1>
          <p className="mt-1 text-gray-500">{category.description ?? "Productos disponibles en tienda."}</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <article key={product.id} className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-lg">
                <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-contain p-3" />
                  ) : (
                    <span className="text-5xl">{emoji}</span>
                  )}
                </div>

                {product.brand && <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{product.brand}</p>}
                <h2 className="mt-1 text-sm font-bold text-gray-900">{product.name}</h2>
                {product.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{product.description}</p>}

                <div className="mt-auto pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-green-700">{money(Number(product.price))}</span>
                    {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                      <span className="text-xs text-gray-400 line-through">{money(Number(product.compare_at_price))}</span>
                    )}
                  </div>

                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: Number(product.price),
                      image_url: product.image_url,
                    }}
                  />

                  <a
                    href={wa + "%20-%20" + encodeURIComponent(product.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex w-full items-center justify-center rounded-full border border-[#25D366] py-2 text-xs font-bold text-[#1da851] hover:bg-green-50"
                  >
                    Consultar
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-10 text-center">
            <div className="text-5xl">📦</div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Estamos cargando esta categoría</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">Los productos con precio e imagen aparecerán aquí tan pronto los añadamos al catálogo.</p>
          </div>
        )}

        <div className="mt-12 rounded-3xl border border-green-100 bg-green-50 p-8 text-center">
          <h3 className="mb-2 text-lg font-bold text-gray-900">¿Buscas algo específico?</h3>
          <p className="mb-5 text-sm text-gray-600">Escríbenos y verificamos disponibilidad en tienda.</p>
          <a href={wa} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-[#25D366] px-8 py-3 text-sm font-bold text-white hover:bg-[#1da851]">
            Chatear por WhatsApp
          </a>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        <p>© 2026 First Choice Pharmacy</p>
      </footer>
    </div>
  );
}
