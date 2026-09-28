"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Issue = { line: number; message: string };
type Report = {
  commit: boolean;
  totalRows: number;
  toCreate: number;
  created: number;
  invalid: Issue[];
  skipped: Issue[];
  failed?: Issue[];
  preview: { line: number; name: string; categorySlug: string; price: number; quantity: number; sku: string | null }[];
};

const TEMPLATE_HEADER = "name,category,price,quantity,brand,sku,upc,presentation_size,description";
const TEMPLATE_EXAMPLE = "Advil 200 mg,dolor-muscular,9.99,12,Advil,ADV-200-24,305730154505,24 tabletas,Alivio del dolor";

function IssueList({ title, items, tone }: { title: string; items: Issue[]; tone: string }) {
  if (!items.length) return null;
  return (
    <details className={`mt-4 rounded-xl border p-4 ${tone}`} open={items.length <= 10}>
      <summary className="cursor-pointer font-semibold">{title} ({items.length})</summary>
      <ul className="mt-3 space-y-1 text-sm">
        {items.map((i) => (
          <li key={`${i.line}-${i.message}`}>Línea {i.line}: {i.message}</li>
        ))}
      </ul>
    </details>
  );
}

export default function ImportProductsPage() {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(commit: boolean) {
    setBusy(true);
    setError("");
    const r = await fetch("/api/admin/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv, commit }),
    });
    if (r.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const d = await r.json();
    setBusy(false);
    if (!r.ok && !d.totalRows) {
      setError(d.error || "No se pudo procesar el archivo.");
      return;
    }
    setReport(d);
  }

  async function onFile(file: File | undefined) {
    setReport(null);
    setError("");
    if (!file) return;
    if (file.size > 2_000_000) {
      setError("El archivo es demasiado grande (máximo 2 MB).");
      return;
    }
    setFileName(file.name);
    setCsv(await file.text());
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-400">FIRST CHOICE PHARMACY</p>
            <h1 className="text-xl font-bold">Importar productos</h1>
          </div>
          <Link href="/admin/products" className="rounded-xl border border-white/15 px-4 py-2 text-sm">← Productos</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">
          <h2 className="text-lg font-bold text-white">Formato del CSV</h2>
          <p className="mt-2">
            Primera fila con encabezados. Obligatorios: <b>name</b>, <b>category</b> (identificador URL de la
            categoría, ej. <code>medicamentos-otc</code>) y <b>price</b>. Opcionales: quantity, brand, sku, upc,
            presentation_size, description. También se aceptan encabezados en español (nombre, categoría, precio,
            cantidad, marca, presentación, descripción). Máximo 1,000 filas y 2 MB.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-4 text-xs text-emerald-200">{TEMPLATE_HEADER}{"\n"}{TEMPLATE_EXAMPLE}</pre>
          <ul className="mt-4 list-disc space-y-1 pl-5">
            <li>Todos los productos se crean como <b>borradores</b>: no aparecen en la tienda hasta que los publiques desde “Editar”.</li>
            <li>Las filas cuyo SKU o UPC ya existe se omiten; nunca se modifican productos existentes.</li>
            <li>Primero verás una revisión sin cambios. Nada se guarda hasta que confirmes.</li>
          </ul>
        </section>

        <div className="mt-8">
          <label className="block text-sm font-semibold">
            Archivo CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            />
          </label>
          {fileName && <p className="mt-2 text-xs text-white/60">{fileName}</p>}
          <button
            onClick={() => run(false)}
            disabled={!csv || busy}
            className="mt-4 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
          >
            {busy && !report ? "Revisando…" : "Revisar archivo"}
          </button>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl bg-red-500/10 p-4 text-red-300">{error}</p>}

        {report && (
          <section className="mt-8" aria-live="polite">
            <h2 className="text-xl font-bold">{report.commit ? "Resultado de la importación" : "Revisión (sin cambios todavía)"}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <Stat n={report.totalRows} t="Filas" />
              <Stat n={report.commit ? report.created : report.toCreate} t={report.commit ? "Creados" : "Se crearían"} />
              <Stat n={report.skipped.length} t="Omitidos" />
              <Stat n={report.invalid.length} t="Con errores" />
            </div>
            <IssueList title="Filas con errores" items={report.invalid} tone="border-red-400/30 text-red-200" />
            <IssueList title="Filas omitidas" items={report.skipped} tone="border-amber-400/30 text-amber-200" />
            <IssueList title="Fallaron al guardar" items={report.failed ?? []} tone="border-red-400/30 text-red-200" />

            {!report.commit && report.preview.length > 0 && (
              <div className="relative mt-6 overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <caption className="p-3 text-left text-white/60">Primeros {report.preview.length} productos a crear</caption>
                  <thead className="bg-white/5 text-white/60">
                    <tr><th className="p-3">Línea</th><th className="p-3">Nombre</th><th className="p-3">Categoría</th><th className="p-3">Precio</th><th className="p-3">Stock</th><th className="p-3">SKU</th></tr>
                  </thead>
                  <tbody>
                    {report.preview.map((p) => (
                      <tr key={p.line} className="border-t border-white/10">
                        <td className="p-3 text-white/60">{p.line}</td><td className="p-3">{p.name}</td><td className="p-3">{p.categorySlug}</td>
                        <td className="p-3">${p.price.toFixed(2)}</td><td className="p-3">{p.quantity}</td><td className="p-3">{p.sku ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!report.commit && report.toCreate > 0 && (
              <button
                onClick={() => run(true)}
                disabled={busy}
                className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
              >
                {busy ? "Importando…" : `Crear ${report.toCreate} productos como borrador`}
              </button>
            )}
            {report.commit && (
              <Link href="/admin/products" className="mt-6 inline-block rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold">
                Ver productos
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ n, t }: { n: number; t: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-2xl font-bold">{n}</p>
      <p className="text-sm text-white/60">{t}</p>
    </div>
  );
}
