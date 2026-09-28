import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { CatalogProduct } from "@/lib/catalog";

/** Homepage section for products the pharmacy marked as featured. Renders nothing when there are none. */
export default function FeaturedProducts({ products }: { products: CatalogProduct[] }) {
  if (!products.length) return null;
  return (
    <section id="destacados" aria-labelledby="featured-heading" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-700">Destacados</p>
            <h2 id="featured-heading" className="mt-2 text-3xl font-extrabold text-gray-900">Productos destacados</h2>
          </div>
          <Link href="/productos" className="py-2 text-sm font-semibold text-green-700 hover:underline">
            Ver todos los productos <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} emoji="🛍️" headingLevel="h3" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
