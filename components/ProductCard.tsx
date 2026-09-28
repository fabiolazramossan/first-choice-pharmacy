import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import { formatMoney, isTrustedProductImage } from "@/lib/catalog-display";
import type { CatalogProduct } from "@/lib/catalog";

const WHATSAPP_BASE = "https://wa.me/17877516646?text=";

export default function ProductCard({
  product,
  emoji,
  headingLevel = "h2",
}: {
  product: CatalogProduct;
  emoji: string;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const consultHref =
    WHATSAPP_BASE + encodeURIComponent(`Hola, quisiera información sobre ${product.name}`);
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price;

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-lg">
      <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
        {isTrustedProductImage(product.image_url) ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-3"
          />
        ) : (
          <span className="text-5xl" aria-hidden="true">{emoji}</span>
        )}
        {!product.in_stock && (
          <span className="absolute left-2 top-2 rounded-full bg-gray-900/80 px-2.5 py-1 text-[11px] font-bold text-white">
            Agotado
          </span>
        )}
      </div>

      {product.brand && (
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{product.brand}</p>
      )}
      <Heading className="mt-1 text-sm font-bold text-gray-900">{product.name}</Heading>
      {product.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{product.description}</p>
      )}

      <div className="mt-auto pt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-green-700">{formatMoney(product.price)}</span>
          {onSale && (
            <span className="text-xs text-gray-500 line-through">
              <span className="sr-only">Precio anterior: </span>
              {formatMoney(product.compare_at_price!)}
            </span>
          )}
        </div>

        <AddToCartButton
          disabled={!product.in_stock}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image_url: product.image_url,
          }}
        />

        <a
          href={consultHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`Consultar por WhatsApp sobre ${product.name} (abre en una pestaña nueva)`}
          className="mt-2 flex w-full items-center justify-center rounded-full border border-[#25D366] py-2 text-xs font-bold text-[#157a3c] hover:bg-green-50"
        >
          Consultar
        </a>
      </div>
    </article>
  );
}
