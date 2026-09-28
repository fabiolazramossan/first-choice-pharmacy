"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only the digest is logged; server error details never reach the browser.
    console.error("Page error", error.digest ?? "");
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <div className="max-w-md text-center" role="alert">
        <h1 className="text-3xl font-extrabold text-gray-900">Algo salió mal</h1>
        <p className="mt-3 text-gray-600">
          No pudimos cargar esta página. Intenta otra vez o llámanos al 787-751-6646.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-bold text-gray-800 hover:border-green-600"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
