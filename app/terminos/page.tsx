import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Términos de Uso | First Choice Pharmacy",
  description: "Términos y Condiciones de First Choice Pharmacy.",
};

export default function Terminos() {
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
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">Legal</span>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Términos de Uso</h1>
          <p className="mt-2 text-sm text-gray-500">Última actualización: 5 de julio de 2026</p>
        </div>
        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceptación</h2><p>Al usar este sitio usted acepta estos términos. Si no está de acuerdo, por favor no use este sitio.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">2. Uso del Sitio</h2><ul className="space-y-2 list-disc list-inside"><li>Proveer información veraz.</li><li>No usar para fines ilegales.</li><li>No transmitir virus u código malicioso.</li><li>No intentar acceder a áreas restringidas.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">3. Servicios Farmacéuticos</h2><p>Las solicitudes de refill están sujetas a verificación de receta, disponibilidad del medicamento y cumplimiento con las regulaciones de la Junta de Farmacia de Puerto Rico.</p></section>
          <section><div className="rounded-2xl border border-red-100 bg-red-50 p-4"><h2 className="text-lg font-bold text-red-900 mb-2">4. Información Médica</h2><p className="text-red-800">El contenido de este sitio es solo informativo. No constituye consejo médico. Siempre consulte con su médico o farmacéutico.</p></div></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">5. Propiedad Intelectual</h2><p>Todo el contenido de este sitio es propiedad de First Choice Pharmacy y está protegido por las leyes de propiedad intelectual.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">6. Limitación de Responsabilidad</h2><p>First Choice Pharmacy no será responsable por daños que resulten del uso de este sitio.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">7. Ley Aplicable</h2><p>Estos términos se rigen por las leyes de Puerto Rico y las leyes federales de los Estados Unidos, incluyendo HIPAA.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">8. Contáctenos</h2><div className="rounded-2xl border border-gray-200 bg-gray-50 p-4"><p><strong>First Choice Pharmacy</strong></p><p>86 C. Georgetti, San Juan, PR 00926</p><p>Tel: 787-751-6646</p></div></section>
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
