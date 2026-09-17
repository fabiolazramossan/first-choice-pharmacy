import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/data";

export const metadata = {
  title: "Privacidad del sitio web",
  description: "Cómo First Choice Pharmacy maneja los datos enviados por este sitio web.",
};

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-white">
      <LegalHeader />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700">
            Privacidad
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
            Privacidad del sitio web
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Última actualización: 17 de septiembre de 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">
          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="mb-2 text-lg font-bold text-blue-900">
              No envíes información médica por este sitio
            </h2>
            <p className="text-blue-800">
              No incluyas diagnósticos, medicamentos, números o imágenes de recetas, fecha de nacimiento ni otra información clínica en formularios o notas. Para asuntos de recetas, llama a la farmacia o visítanos.
            </p>
          </section>

          <Section title="1. Alcance de esta política">
            <p>
              Esta política explica el manejo de la información enviada mediante este sitio. No sustituye el Aviso de Prácticas de Privacidad de la farmacia relacionado con información de salud protegida; puedes solicitar ese aviso directamente en la farmacia.
            </p>
          </Section>

          <Section title="2. Información que recopilamos">
            <ul className="list-inside list-disc space-y-2">
              <li>Solicitud de refill: nombre, teléfono y mensaje opcional.</li>
              <li>Órdenes de productos sin receta: nombre, teléfono, correo opcional, productos, método de entrega y, si eliges delivery, dirección.</li>
              <li>Datos técnicos básicos necesarios para seguridad y funcionamiento, como dirección IP, navegador, fecha y hora de la solicitud.</li>
            </ul>
          </Section>

          <Section title="3. Cómo usamos la información">
            <ul className="list-inside list-disc space-y-2">
              <li>Responder a tu solicitud y comunicarnos contigo.</li>
              <li>Confirmar disponibilidad, entrega y total de una orden.</li>
              <li>Proteger el sitio contra fraude, abuso y ataques.</li>
              <li>Cumplir obligaciones legales aplicables.</li>
            </ul>
          </Section>

          <Section title="4. Proveedores de servicio">
            <p>
              Usamos proveedores de alojamiento, base de datos y correo para operar el sitio. Estos proveedores pueden procesar la información técnica o de contacto necesaria para prestar esos servicios. No vendemos tu información personal.
            </p>
          </Section>

          <Section title="5. Conservación y seguridad">
            <p>
              Conservamos la información durante el tiempo razonablemente necesario para atender la solicitud, mantener registros comerciales y cumplir obligaciones aplicables. Utilizamos HTTPS, controles de acceso y validaciones del lado del servidor; ningún sistema en internet puede garantizar seguridad absoluta.
            </p>
          </Section>

          <Section title="6. Tus opciones">
            <p>
              Puedes optar por no usar los formularios y comunicarte por teléfono o en persona. Para solicitar acceso, corrección o eliminación de información enviada por el sitio, comunícate con la farmacia. Algunas solicitudes pueden estar sujetas a requisitos legales de conservación.
            </p>
          </Section>

          <Section title="7. Contacto">
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
      <LegalFooter />
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

function LegalHeader() {
  return (
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
  );
}

function LegalFooter() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
      <p>© 2026 {BRAND.name}.</p>
      <div className="mt-2 flex justify-center gap-4">
        <Link href="/privacidad" className="hover:text-green-700">Privacidad</Link>
        <Link href="/terminos" className="hover:text-green-700">Términos</Link>
      </div>
    </footer>
  );
}
