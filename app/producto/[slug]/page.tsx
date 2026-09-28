import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import CatalogHeader from "@/components/CatalogHeader";
import { getProductBySlug } from "@/lib/catalog";
import { categoryEmoji, formatMoney, isTrustedProductImage } from "@/lib/catalog-display";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Producto no encontrado", robots: { index: false } };
  const description =
    product.description ??
    `${product.name}${product.brand ? ` de ${product.brand}` : ""} disponible en First Choice Pharmacy, San Juan, Puerto Rico.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: isTrustedProductImage(product.image_url) ? [product.image_url] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const emoji = categoryEmoji(product.category.slug);
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price;
  const consultHref =
    "https://wa.me/17877516646?text=" +
    encodeURIComponent(`Hola, quisiera información sobre ${product.name}`);

  // Offers (price/availability) are only advertised to search engines once
  // online ordering is actually open.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.description ? { description: product.description } : {}),
    ...(isTrustedProductImage(product.image_url) ? { image: product.image_url } : {}),
    url: `${SITE_URL}/producto/${product.slug}`,
    ...(process.env.ORDERS_ENABLED === "true"
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: product.price.toFixed(2),
            availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <main id="contenido" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-gray-600">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/productos" className="hover:text-green-700 hover:underline">Productos</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/productos/${product.category.slug}`} className="hover:text-green-700 hover:underline">{product.category.name}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
            {isTrustedProductImage(product.image_url) ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-6"
              />
            ) : (
              <span className="text-8xl" aria-hidden="true">{emoji}</span>
            )}
          </div>

          <div>
            {product.brand && (
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">{product.brand}</p>
            )}
            <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">{product.name}</h1>
            {product.presentation_size && <p className="mt-2 text-gray-600">{product.presentation_size}</p>}

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-green-700">{formatMoney(product.price)}</span>
              {onSale && (
                <span className="text-base text-gray-500 line-through">
                  <span className="sr-only">Precio anterior: </span>
                  {formatMoney(product.compare_at_price!)}
                </span>
              )}
            </div>
            <p className={`mt-2 text-sm font-semibold ${product.in_stock ? "text-green-700" : "text-gray-600"}`}>
              {product.in_stock ? "Disponible en tienda" : "Agotado por el momento"}
            </p>

            <div className="mt-6 max-w-sm">
              <AddToCartButton
                disabled={!product.in_stock}
                product={{ id: product.id, name: product.name, slug: product.slug, price: product.price, image_url: product.image_url }}
              />
              <a
                href={consultHref}
                target="_blank"
                rel="noreferrer"
                aria-label={`Consultar por WhatsApp sobre ${product.name} (abre en una pestaña nueva)`}
                className="mt-3 flex w-full items-center justify-center rounded-full border border-[#25D366] py-2.5 text-sm font-bold text-[#157a3c] hover:bg-green-50"
              >
                Consultar por WhatsApp
              </a>
            </div>

            {product.description && (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-gray-900">Descripción</h2>
                <p className="mt-2 whitespace-pre-line text-gray-700">{product.description}</p>
              </section>
            )}

            <p className="mt-8 rounded-2xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
              Producto sin receta. El precio final, el IVU y la disponibilidad se confirman con la farmacia.
              Lee y sigue las instrucciones de la etiqueta; consulta a nuestro farmacéutico si tienes dudas.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
        <p>© 2026 First Choice Pharmacy</p>
      </footer>
    </div>
  );
}
