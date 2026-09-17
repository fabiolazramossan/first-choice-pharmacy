import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/data";

export const metadata = {
  title: "Términos de uso y órdenes",
  description: "Términos de uso y órdenes en línea de First Choice Pharmacy.",
};

export default function Terminos() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/">
            <Image src="/logo.png" alt={BRAND.name} width={140} height={46} className="h-11 w-auto object-contain" />
          </Link>
          <Link href="/" className="text-sm font-semibold text-green-700 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
            Términos
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
            Términos de uso y órdenes
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Última actualización: 17 de septiembre de 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">
          <Section title="1. Aceptación">
            <p>Al usar este sitio o enviar una orden, aceptas estos términos y nuestra política de privacidad.</p>
          </Section>

          <Section title="2. Productos disponibles en línea">
            <p>
              El carrito en línea es exclusivamente para productos que no requieren receta. Las solicitudes de medicamentos con receta se manejan por separado y están sujetas a validación del paciente, receta válida, disponibilidad y leyes aplicables.
            </p>
          </Section>

          <Section title="3. Órdenes, precios e inventario">
            <ul className="list-inside list-disc space-y-2">
              <li>Enviar una orden representa una solicitud; no garantiza aceptación ni disponibilidad.</li>
              <li>La farmacia verificará los productos, cantidades, IVU y cualquier cargo de delivery.</li>
              <li>El total final se confirma contigo antes del cobro.</li>
              <li>Podemos limitar cantidades o cancelar artículos agotados, duplicados o con información incorrecta.</li>
            </ul>
          </Section>

          <Section title="4. Pago y entrega">
            <p>
              En esta etapa, el sitio no captura tarjetas. El pago se coordina con la farmacia al recoger o recibir la orden. El delivery depende del área de servicio, horario, disponibilidad y tarifa confirmada por la farmacia.
            </p>
          </Section>

          <section className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <h2 className="mb-2 text-lg font-bold text-red-900">5. Información médica y emergencias</h2>
            <p className="text-red-800">
              El contenido del sitio es informativo y no sustituye consejo médico. No uses formularios de la web para emergencias ni incluyas información médica. En una emergencia, llama al 911.
            </p>
          </section>

          <Section title="6. Uso permitido">
            <p>
              No puedes interferir con el sitio, introducir código malicioso, enviar solicitudes automatizadas, suplantar a otra persona ni usar el servicio para actividades ilegales.
            </p>
          </Section>

          <Section title="7. Cambios y disponibilidad">
            <p>
              Podemos corregir información, actualizar estos términos o suspender funciones para mantenimiento o seguridad. La fecha de actualización aparecerá en esta página.
            </p>
          </Section>

          <Section title="8. Ley aplicable">
            <p>Estos términos se interpretan de acuerdo con las leyes aplicables de Puerto Rico y de los Estados Unidos.</p>
          </Section>

          <Section title="9. Contacto">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-bold text-gray-900">{BRAND.name}</p>
              <p>{BRAND.address}</p>
              <p>
                Teléfono: <a className="font-semibold text-green-700" href={BRAND.phoneHref}>{BRAND.phone}</a>
              </p>
            </div>
          </Section>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        <p>© 2026 {BRAND.name}.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacidad" className="hover:text-green-700">Privacidad</Link>
          <Link href="/terminos" className="hover:text-green-700">Términos</Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}
