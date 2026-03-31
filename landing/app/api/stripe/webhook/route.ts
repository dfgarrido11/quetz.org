export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function getSubjectLine(language: string | undefined): string {
  if (language === "en") return "Welcome to Quetz.org! Your tree is growing 🌱";
  if (language === "de") return "Willkommen bei Quetz.org! Dein Baum wächst 🌱";
  return "¡Bienvenido a Quetz.org! Tu árbol está creciendo 🌱";
}

function buildWelcomeEmail(customerName: string, language: string | undefined): string {
  const isEn = language === "en";
  const isDe = language === "de";

  const greeting = isEn
    ? `Hello${customerName ? `, ${customerName}` : ""}!`
    : isDe
    ? `Hallo${customerName ? `, ${customerName}` : ""}!`
    : `¡Hola${customerName ? `, ${customerName}` : ""}!`;

  const intro = isEn
    ? "Thank you for adopting a tree with Quetz.org. Your support is making a real difference for our reforestation project and for the 120 children in our school program."
    : isDe
    ? "Vielen Dank, dass du einen Baum bei Quetz.org adoptiert hast. Deine Unterstützung macht einen echten Unterschied für unser Aufforstungsprojekt und die 120 Kinder in unserem Schulprogramm."
    : "Gracias por adoptar un árbol con Quetz.org. Tu apoyo está generando un impacto real en nuestro proyecto de reforestación y en los 120 niños de nuestro programa escolar.";

  const nextStepsTitle = isEn ? "What happens next?" : isDe ? "Was passiert als Nächstes?" : "¿Qué pasa ahora?";

  const steps = isEn
    ? [
        "📍 <strong>GPS coordinates</strong> — You'll receive the exact location of your tree.",
        "📸 <strong>Monthly updates</strong> — Photos and growth reports sent to your inbox.",
        "🌳 <strong>Personal dashboard</strong> — Track your tree's progress anytime.",
        "🏫 <strong>School impact</strong> — Your adoption supports 120 children learning about conservation.",
      ]
    : isDe
    ? [
        "📍 <strong>GPS-Koordinaten</strong> — Du erhältst den genauen Standort deines Baumes.",
        "📸 <strong>Monatliche Updates</strong> — Fotos und Wachstumsberichte in deinem Postfach.",
        "🌳 <strong>Persönliches Dashboard</strong> — Verfolge den Fortschritt deines Baumes jederzeit.",
        "🏫 <strong>Schulprojekt-Impact</strong> — Deine Adoption unterstützt 120 Kinder beim Lernen über Naturschutz.",
      ]
    : [
        "📍 <strong>Coordenadas GPS</strong> — Recibirás la ubicación exacta de tu árbol.",
        "📸 <strong>Actualizaciones mensuales</strong> — Fotos e informes de crecimiento en tu bandeja de entrada.",
        "🌳 <strong>Panel personal</strong> — Sigue el progreso de tu árbol en cualquier momento.",
        "🏫 <strong>Impacto escolar</strong> — Tu adopción apoya a 120 niños aprendiendo sobre conservación.",
      ];

  const ctaText = isEn ? "Visit My Forest" : isDe ? "Mein Wald besuchen" : "Visitar Mi Bosque";
  const ctaUrl = "https://quetz.org/mi-bosque";

  const mascotLine = isEn
    ? "Quetzito, our little quetzal mascot, is watching over your tree. 🦜"
    : isDe
    ? "Quetzito, unser kleines Quetzal-Maskottchen, wacht über deinen Baum. 🦜"
    : "Quetzito, nuestra pequeña mascota quetzal, está cuidando tu árbol. 🦜";

  const footer = isEn
    ? "With gratitude from the Quetz.org team"
    : isDe
    ? "Mit Dankbarkeit vom Quetz.org-Team"
    : "Con gratitud del equipo de Quetz.org";

  return `<!DOCTYPE html>
<html lang="${isEn ? "en" : isDe ? "de" : "es"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quetz.org</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(45,106,79,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2D6A4F 0%,#52B788 100%);padding:40px 32px;text-align:center;">
              <div style="font-size:36px;font-weight:800;color:#ffffff;letter-spacing:-1px;margin-bottom:4px;">
                🌳 Quetz.org
              </div>
              <div style="font-size:14px;color:#b7e4c7;letter-spacing:2px;text-transform:uppercase;">
                Reforestation &bull; Conservation &bull; Community
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">

              <p style="font-size:22px;font-weight:700;color:#2D6A4F;margin:0 0 12px;">
                ${greeting}
              </p>

              <p style="font-size:15px;line-height:1.7;color:#374151;margin:0 0 28px;">
                ${intro}
              </p>

              <!-- Quetzito mascot callout -->
              <div style="background:linear-gradient(135deg,#d8f3dc,#b7e4c7);border-left:4px solid #52B788;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                <p style="margin:0;font-size:14px;color:#2D6A4F;font-style:italic;">
                  ${mascotLine}
                </p>
              </div>

              <!-- Next steps -->
              <p style="font-size:16px;font-weight:700;color:#2D6A4F;margin:0 0 16px;">
                ${nextStepsTitle}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                ${steps
                  .map(
                    (step) => `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #d8f3dc;font-size:14px;line-height:1.6;color:#374151;">
                    ${step}
                  </td>
                </tr>`
                  )
                  .join("")}
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#2D6A4F,#52B788);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 36px;border-radius:50px;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(45,106,79,0.3);">
                      ${ctaText} →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px;color:#6b7280;margin:0;">
                ${footer}
              </p>
              <p style="font-size:20px;margin:8px 0 0;">🌱</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0f7f4;padding:20px 32px;text-align:center;border-top:1px solid #d8f3dc;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Quetz.org &bull; <a href="https://quetz.org" style="color:#52B788;text-decoration:none;">quetz.org</a>
                &bull; <a href="mailto:hola@quetz.org" style="color:#52B788;text-decoration:none;">hola@quetz.org</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">
                You're receiving this because you adopted a tree with Quetz.org.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_email ?? session.customer_details?.email ?? "";
    const customerName = session.customer_details?.name ?? "";
    const metadata = session.metadata ?? {};

    console.log("checkout.session.completed:", {
      email: customerEmail,
      name: customerName,
      metadata,
      sessionId: session.id,
    });

    if (customerEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.zoho.eu",
          port: 587,
          secure: false,
          auth: {
            user: "hola@quetz.org",
            pass: process.env.ZOHO_SMTP_PASSWORD,
          },
        });

        const language = metadata.language as string | undefined;

        // Welcome email to customer
        await transporter.sendMail({
          from: "Quetz.org 🌳 <hola@quetz.org>",
          to: customerEmail,
          subject: getSubjectLine(language),
          html: buildWelcomeEmail(customerName, language),
        });

        // Notification email to team
        await transporter.sendMail({
          from: "Quetz.org 🌳 <hola@quetz.org>",
          to: "dgarrido@quetz.org",
          subject: `[Quetz] New tree adoption — ${customerEmail}`,
          html: `
            <h2>New Checkout Completed</h2>
            <table style="font-family:monospace;border-collapse:collapse;">
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Session ID</td><td>${session.id}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Customer Email</td><td>${customerEmail}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Customer Name</td><td>${customerName}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Amount Total</td><td>${session.amount_total != null ? (session.amount_total / 100).toFixed(2) : "—"} ${session.currency?.toUpperCase() ?? ""}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Metadata</td><td><pre>${JSON.stringify(metadata, null, 2)}</pre></td></tr>
            </table>
          `,
        });

        console.log("Welcome emails sent to:", customerEmail);
      } catch (mailErr) {
        console.error("Failed to send welcome email:", mailErr);
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
