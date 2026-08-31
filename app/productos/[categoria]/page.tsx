import { PRODUCT_CATEGORIES } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

export function generateStaticParams() {
  return PRODUCT_CATEGORIES.map((cat) => ({ categoria: slugify(cat.name) }));
}

type Props = { params: { categoria: string } };

export default function CategoriaPage({ params }: Props) {
  const cat = PRODUCT_CATEGORIES.find((c) => slugify(c.name) === params.categoria);
  if (!cat) return notFound();

  const wa =
    "https://wa.me/17877516646?text=" +
    encodeURIComponent("Hola, quisiera información sobre " + cat.name);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="First Choice Pharmacy" width={140} height={46} className="h-11 w-auto object-contain" />
          </Link>
          <Link href="/#products" className="text-sm font-semibold text-green-600 hover:underline">
            Volver a productos
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <span className="text-4xl">{cat.emoji}</span>
          <h1 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">{cat.name}</h1>
          <p className="mt-1 text-gray-500">{cat.desc}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {cat.items.map((item) => (
            <div
              key={item}
              className={"flex flex-col items-center rounded-3xl border bg-gradient-to-br " + cat.gradient + " " + cat.border + " p-5 shadow-sm transition-all hover:shadow-lg"}
            >
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-md">
                {cat.emoji}
              </div>
              <h3 className="mb-3 text-center text-sm font-bold text-gray-900">{item}</h3>
              
                href={wa + "%20-%20" + encodeURIComponent(item)}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center rounded-full bg-[#25D366] py-2 text-xs font-bold text-white hover:bg-[#1da851]"
              >
                Consultar
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-green-100 bg-green-50 p-8 text-center">
          <h3 className="mb-2 text-lg font-bold text-gray-900">¿Buscas algo específico?</h3>
          <p className="mb-5 text-sm text-gray-600">Escríbenos y verificamos disponibilidad en tienda.</p>
          
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full bg-[#25D366] px-8 py-3 text-sm font-bold text-white hover:bg-[#1da851]"
          >
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