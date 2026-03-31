export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const confirmationText: Record<string, { subject: string; body: string }> = {
  en: {
    subject: "🌳 Welcome to the Quetz Impact Report!",
    body: `<p style="font-size:16px;line-height:1.7;color:#374151;">Thank you for subscribing! Every month you'll receive real updates: trees planted, families supported, and school progress — directly from Zacapa, Guatemala.</p>`,
  },
  de: {
    subject: "🌳 Willkommen beim Quetz Impact Report!",
    body: `<p style="font-size:16px;line-height:1.7;color:#374151;">Danke für deine Anmeldung! Jeden Monat erhältst du echte Updates: gepflanzte Bäume, unterstützte Familien und Schulbau-Fortschritt — direkt aus Zacapa, Guatemala.</p>`,
  },
  fr: {
    subject: "🌳 Bienvenue dans le Rapport d'Impact Quetz !",
    body: `<p style="font-size:16px;line-height:1.7;color:#374151;">Merci pour votre inscription ! Chaque mois, vous recevrez de vraies mises à jour : arbres plantés, familles soutenues et avancement de l'école — directement depuis Zacapa, Guatemala.</p>`,
  },
  ar: {
    subject: "🌳 مرحباً بك في تقرير تأثير Quetz!",
    body: `<p style="font-size:16px;line-height:1.7;color:#374151;direction:rtl;text-align:right;">شكراً لاشتراكك! ستتلقى كل شهر تحديثات حقيقية: الأشجار المزروعة، والعائلات المدعومة، وتقدم بناء المدرسة — مباشرة من زاكابا، غواتيمالا.</p>`,
  },
  es: {
    subject: "🌳 ¡Bienvenido/a al Informe de Impacto Quetz!",
    body: `<p style="font-size:16px;line-height:1.7;color:#374151;">¡Gracias por suscribirte! Cada mes recibirás actualizaciones reales: árboles plantados, familias apoyadas y avance de la escuela — directamente desde Zacapa, Guatemala.</p>`,
  },
};

function buildConfirmationEmail(lang: string): string {
  const c = confirmationText[lang] ?? confirmationText.es;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f0f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f0f7f4;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(8,28,21,0.12);">
        <tr>
          <td style="background:linear-gradient(160deg,#081C15 0%,#1B4332 50%,#52B788 100%);padding:40px 32px;text-align:center;">
            <div style="font-size:36px;font-weight:900;color:#fff;letter-spacing:-1px;margin-bottom:6px;">QUETZ.ORG</div>
            <div style="font-size:13px;color:#B7E4C7;letter-spacing:2px;text-transform:uppercase;">Impact Report</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px 28px;">
            ${c.body}
            <div style="margin-top:24px;text-align:center;">
              <a href="https://quetz.org"
                 style="display:inline-block;background:linear-gradient(135deg,#1B4332,#52B788);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:50px;box-shadow:0 4px 12px rgba(45,106,79,0.3);">
                🌿 Visitar Quetz.org
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:linear-gradient(135deg,#081C15,#1B4332);padding:24px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#B7E4C7;">Con amor desde Guatemala 🇬🇹</p>
            <p style="margin:0;font-size:12px;color:#52B788;">
              <a href="https://quetz.org" style="color:#52B788;text-decoration:none;">quetz.org</a>
              &nbsp;&bull;&nbsp;
              <a href="mailto:hola@quetz.org" style="color:#52B788;text-decoration:none;">hola@quetz.org</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, language, source } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const lang = (language as string) || "es";

    // Save to Lead table (upsert to avoid duplicates)
    await prisma.lead.upsert({
      where: { email },
      update: {},
      create: {
        nombre: email.split("@")[0],
        email,
        pais: source || "newsletter",
      },
    });

    // Send confirmation email (fire-and-forget — don't block the response)
    const c = confirmationText[lang] ?? confirmationText.es;
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.eu",
      port: 587,
      secure: false,
      auth: { user: "hola@quetz.org", pass: process.env.ZOHO_SMTP_PASSWORD },
    });

    transporter.sendMail({
      from: "Quetz.org 🌳 <hola@quetz.org>",
      to: email,
      subject: c.subject,
      html: buildConfirmationEmail(lang),
    }).catch((err) => console.error("[newsletter] email failed:", err));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[newsletter POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
