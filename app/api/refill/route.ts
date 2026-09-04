import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting en memoria
const requests = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 3;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

// Limpia texto de cualquier código malicioso
function sanitize(input: string): string {
  return String(input)
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim()
    .slice(0, 200);
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta en 15 minutos." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const nombre = sanitize(body.nombre || "");
    const telefono = sanitize(body.telefono || "");
    const mensaje = sanitize(body.mensaje || "");

    // Validación
    if (nombre.length < 2 || nombre.length > 100) {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }
    if (!/^[\d\s\-\+\(\)]{7,20}$/.test(telefono)) {
      return NextResponse.json({ error: "Teléfono inválido" }, { status: 400 });
    }

    await resend.emails.send({
      from: "First Choice Pharmacy <onboarding@resend.dev>",
      to: process.env.PHARMACY_EMAIL || "firstpharmacy.3pr@gmail.com",
      subject: "Nueva solicitud de refill",
      html:
        '<div style="font-family: system-ui, sans-serif; max-width: 600px;">' +
        '<h2 style="color: #16a34a;">Nueva Solicitud de Refill</h2>' +
        '<table style="width: 100%; border-collapse: collapse;">' +
        '<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Nombre:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">' +
        nombre +
        "</td></tr>" +
        '<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Teléfono:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">' +
        telefono +
        "</td></tr>" +
        (mensaje
          ? '<tr><td style="padding: 8px;"><strong>Mensaje:</strong></td><td style="padding: 8px;">' +
            mensaje +
            "</td></tr>"
          : "") +
        "</table>" +
        '<p style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 8px; color: #92400e; font-size: 13px;">' +
        "<strong>Importante:</strong> Contactar al cliente por teléfono para obtener el número de receta y verificar identidad." +
        "</p>" +
        "</div>",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}