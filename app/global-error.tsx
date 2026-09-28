"use client";

// Last-resort boundary for errors thrown by the root layout itself.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "4rem 1rem" }}>
        <h1>Algo salió mal</h1>
        <p>Intenta otra vez o llámanos al 787-751-6646.</p>
        <button type="button" onClick={reset} style={{ marginTop: "1rem", padding: "0.75rem 1.5rem" }}>
          Intentar de nuevo
        </button>
      </body>
    </html>
  );
}
