import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <div className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">Error 404</p>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900">No encontramos esta página</h1>
        <p className="mt-3 text-gray-600">
          Es posible que el enlace haya cambiado o que el producto ya no esté disponible.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700">
            Ir al inicio
          </Link>
          <Link
            href="/productos"
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-bold text-gray-800 hover:border-green-600"
          >
            Ver productos
          </Link>
        </div>
      </div>
    </main>
  );
}
