import { Resend } from "resend";
import { NextResponse } from "next/server";
import {
  cleanText,
  escapeHtml,
  exceedsBodyLimit,
  getClientIp,
  isTrustedBrowserRequest,
  isValidPhone,
} from "@/lib/server-security";

const requests = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 3;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  if (!isTrustedBrowserRequest(request)) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }

  if (exceedsBodyLimit(request, 8_000)) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured.");

      return NextResponse.json(
        {
          error: "El servicio de refill no está configurado todavía.",
        },
        {
          status: 503,
        }
      );
    }

    const resend = new Resend(resendApiKey);

    const ip = getClientIp(request);

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: "Demasiadas solicitudes. Intenta nuevamente en 15 minutos.",
        },
        {
          status: 429,
        }
      );
    }

    const body = await request.json();

    const nombre = cleanText(body.nombre, 100);
    const telefono = cleanText(body.telefono, 24);
    const mensaje = cleanText(body.mensaje, 200);
    const honeypot = cleanText(body.website, 80);
    const startedAt = Number(body.startedAt);

    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    if (
      !Number.isFinite(startedAt) ||
      Date.now() - startedAt < 2_000 ||
      Date.now() - startedAt > 60 * 60 * 1000
    ) {
      return NextResponse.json(
        { error: "Actualiza la página e intenta otra vez." },
        { status: 400 }
      );
    }

    if (nombre.length < 2 || nombre.length > 100) {
      return NextResponse.json(
        {
          error: "Nombre inválido.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidPhone(telefono)) {
      return NextResponse.json(
        {
          error: "Teléfono inválido.",
        },
        {
          status: 400,
        }
      );
    }

    const nombreSeguro = escapeHtml(nombre);
    const telefonoSeguro = escapeHtml(telefono);
    const mensajeSeguro = escapeHtml(mensaje);

    const pharmacyEmail =
      process.env.PHARMACY_EMAIL || "firstpharmacy.3pr@gmail.com";

    const result = await resend.emails.send({
      from:
        process.env.REFILL_FROM_EMAIL ||
        "First Choice Pharmacy <onboarding@resend.dev>",
      to: pharmacyEmail,
      subject: "Nueva solicitud de refill",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#16a34a;">
            Nueva solicitud de refill
          </h2>

          <p>
            <strong>Nombre:</strong>
            ${nombreSeguro}
          </p>

          <p>
            <strong>Teléfono:</strong>
            ${telefonoSeguro}
          </p>

          ${
            mensajeSeguro
              ? `
                <p>
                  <strong>Mensaje:</strong>
                  ${mensajeSeguro}
                </p>
              `
              : ""
          }

          <div
            style="
              margin-top:20px;
              padding:14px;
              background:#fef3c7;
              border-radius:8px;
              color:#92400e;
              font-size:13px;
            "
          >
            <strong>Importante:</strong>
            Contactar al cliente por teléfono para verificar identidad
            y obtener cualquier información necesaria de la receta.
            No solicitar información médica sensible por email.
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error("Resend refill error:", result.error.name);

      return NextResponse.json(
        {
          error: "No se pudo enviar la solicitud.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Refill API error.");

    return NextResponse.json(
      {
        error: "Error interno.",
      },
      {
        status: 500,
      }
    );
  }
}
