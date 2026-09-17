# First Choice Pharmacy

Sitio web y catálogo de First Choice Pharmacy en San Juan, Puerto Rico. Está construido con Next.js 15, React 19, Tailwind CSS, Supabase y Resend.

## Funciones disponibles

- Catálogo por categorías alimentado por Supabase.
- Carrito persistente en el navegador.
- Checkout para productos sin receta, con recogido o delivery.
- Solicitudes de pedido enviadas a la farmacia por email.
- Formulario de refill que pide solamente nombre, teléfono y un mensaje no clínico.
- Enlaces de WhatsApp y llamada, SEO local, datos estructurados y diseño responsive.
- Validación de precios y productos en el servidor; el navegador no determina el total enviado.

El checkout no captura tarjetas. La farmacia confirma disponibilidad, IVU, tarifa de delivery y total final antes de cobrar al recoger o recibir. Los productos cuyo nombre comienza con `[PRUEBA]` solo aparecen en previews, nunca en producción.

## Desarrollo local

Requiere Node.js 20 o posterior.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Copia `.env.example` y configura:

- `NEXT_PUBLIC_SITE_URL`: URL canónica del sitio.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: clave pública de Supabase; RLS debe permanecer activo.
- `RESEND_API_KEY`: clave privada de Resend, solo para el servidor.
- `PHARMACY_EMAIL`: buzón que recibe pedidos y solicitudes de refill.
- `REFILL_FROM_EMAIL` y `ORDER_FROM_EMAIL`: remitentes verificados en Resend.

## Verificación antes de producción

1. Confirmar dirección, teléfono y horarios en `lib/data.ts` y `app/layout.tsx`.
2. Cargar productos reales con precio, inventario e imagen en Supabase.
3. Confirmar dominio y remitentes de Resend; no depender de `onboarding@resend.dev` en producción.
4. Probar una orden y un refill con el equipo de la farmacia.
5. Revisar la política de privacidad y el aviso de prácticas de privacidad oficial con el responsable de cumplimiento.
6. Ejecutar `npm run build` y `npm audit --omit=dev`.

## Seguridad y privacidad

- Las rutas de pedido y refill aplican validación, límites básicos, honeypot y comprobación de origen.
- No se solicitan números de receta, diagnósticos ni documentos médicos en la web.
- Supabase usa una clave pública con Row Level Security; nunca se debe exponer una service-role key en el navegador.
- Los datos del carrito se consideran no confiables y se vuelven a validar contra Supabase en el servidor.

© 2026 First Choice Pharmacy
