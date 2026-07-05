import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Política de Privacidad | First Choice Pharmacy",
  description: "Política de Privacidad de First Choice Pharmacy.",
};

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/"><Image src="/logo.png" alt="First Choice Pharmacy" width={140} height={46} className="h-11 w-auto object-contain" /></Link>
          <Link href="/" className="text-sm font-semibold text-green-600 hover:underline">← Volver al inicio</Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700">Legal</span>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Política de Privacidad</h1>
          <p className="mt-2 text-sm text-gray-500">Última actualización: 5 de julio de 2026</p>
        </div>
        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Aviso de Prácticas de Privacidad (HIPAA)</h2>
            <p className="text-blue-800">Este aviso describe cómo la información médica sobre usted puede ser usada y divulgada. Por favor léalo cuidadosamente.</p>
          </section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">1. Quiénes Somos</h2><p>First Choice Pharmacy, 86 C. Georgetti, San Juan, PR 00926. Farmacia comunitaria comprometida con la protección de su información personal y de salud.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">2. Información que Recopilamos</h2><ul className="space-y-2 list-disc list-inside"><li>Nombre completo, fecha de nacimiento, teléfono.</li><li>Número de receta, nombre del medicamento, imagen de receta (PHI).</li><li>Datos de navegación: IP, navegador, páginas visitadas.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">3. Cómo Usamos su Información</h2><ul className="space-y-2 list-disc list-inside"><li>Procesar solicitudes de refill.</li><li>Comunicarnos sobre el estado de su receta.</li><li>Coordinar delivery.</li><li>Cumplir requisitos legales.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">4. HIPAA</h2><p>Su información de salud protegida solo se usa para tratamiento, pago y operaciones. <strong className="text-red-700">No vendemos ni compartimos su información con terceros.</strong></p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">5. Sus Derechos</h2><ul className="space-y-2 list-disc list-inside"><li>Acceder a su información de salud.</li><li>Solicitar correcciones.</li><li>Solicitar restricciones de uso.</li><li>Presentar quejas ante el HHS.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">6. Seguridad</h2><ul className="space-y-2 list-disc list-inside"><li>HTTPS/SSL en todas las transmisiones.</li><li>Acceso restringido a PHI.</li><li>Revisiones periódicas de seguridad.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">7. Contáctenos</h2><div className="rounded-2xl border border-gray-200 bg-gray-50 p-4"><p><strong>First Choice Pharmacy</strong></p><p>86 C. Georgetti, San Juan, PR 00926</p><p>Tel: 787-751-6646</p></div></section>
          <section className="rounded-2xl border border-yellow-100 bg-yellow-50 p-6"><p className="text-yellow-800"><strong>Aviso Legal:</strong> Consulte con un abogado especializado en HIPAA en Puerto Rico para asegurar cumplimiento total.</p></section>
        </div>
      </main>
      <footer className="border-t border-gray-100 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        <p>© 2026 First Choice Pharmacy.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacidad" className="hover:text-green-600">Política de Privacidad</Link>
          <Link href="/terminos" className="hover:text-green-600">Términos de Uso</Link>
        </div>
      </footer>
    </div>
  );
}
