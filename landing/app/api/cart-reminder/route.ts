export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

// This endpoint is called by a cron job (e.g., Railway cron or Vercel cron)
// It sends abandoned cart reminder emails to users who added items but didn't checkout
// The cron should call this endpoint every hour with a secret key

const CRON_SECRET = process.env.CRON_SECRET || 'quetz-cron-secret-2024';

interface AbandonedCartItem {
  name: string;
  type: 'one-time' | 'subscription';
  price: number;
  quantity?: number;
  treesPerMonth?: number;
}

interface AbandonedCartPayload {
  secret: string;
  userEmail: string;
  userName: string;
  language: string;
  items: AbandonedCartItem[];
  totalValue: number;
  cartUrl: string;
}

function getEmailContent(
  userName: string,
  items: AbandonedCartItem[],
  totalValue: number,
  cartUrl: string,
  language: string
) {
  const firstName = userName?.split(' ')[0] || userName;

  const translations: Record<string, {
    subject: string;
    greeting: string;
    leftBehind: string;
    subtitle: string;
    yourCart: string;
    completeOrder: string;
    impact: string;
    impactText: string;
    footer: string;
    unsubscribe: string;
  }> = {
    es: {
      subject: `${firstName}, tus árboles te están esperando 🌳`,
      greeting: `Hola, ${firstName}`,
      leftBehind: 'Dejaste algo en tu carrito',
      subtitle: 'Tus árboles están listos para ser plantados en Zacapa, Guatemala. Solo falta un paso.',
      yourCart: 'Tu carrito',
      completeOrder: 'Completar mi pedido',
      impact: 'Tu impacto potencial',
      impactText: 'Con tu adopción, una familia agricultora en Guatemala tendrá ingresos estables y los niños de Zacapa estarán un paso más cerca de tener su escuela.',
      footer: 'El equipo de Quetz · hola@quetz.org',
      unsubscribe: 'Si no deseas recibir estos recordatorios, puedes ignorar este email.',
    },
    de: {
      subject: `${firstName}, deine Bäume warten auf dich 🌳`,
      greeting: `Hallo, ${firstName}`,
      leftBehind: 'Du hast etwas in deinem Warenkorb vergessen',
      subtitle: 'Deine Bäume sind bereit, in Zacapa, Guatemala gepflanzt zu werden. Nur noch ein Schritt.',
      yourCart: 'Dein Warenkorb',
      completeOrder: 'Bestellung abschließen',
      impact: 'Deine potenzielle Wirkung',
      impactText: 'Mit deiner Adoption erhält eine Bauernfamilie in Guatemala ein stabiles Einkommen und die Kinder in Zacapa sind einen Schritt näher an ihrer Schule.',
      footer: 'Das Quetz-Team · hola@quetz.org',
      unsubscribe: 'Wenn du diese Erinnerungen nicht erhalten möchtest, kannst du diese E-Mail ignorieren.',
    },
    en: {
      subject: `${firstName}, your trees are waiting for you 🌳`,
      greeting: `Hello, ${firstName}`,
      leftBehind: 'You left something in your cart',
      subtitle: 'Your trees are ready to be planted in Zacapa, Guatemala. Just one step left.',
      yourCart: 'Your cart',
      completeOrder: 'Complete my order',
      impact: 'Your potential impact',
      impactText: 'With your adoption, a farming family in Guatemala will have stable income and the children of Zacapa will be one step closer to having their school.',
      footer: 'The Quetz Team · hola@quetz.org',
      unsubscribe: 'If you don\'t want to receive these reminders, you can ignore this email.',
    },
    fr: {
      subject: `${firstName}, tes arbres t'attendent 🌳`,
      greeting: `Bonjour, ${firstName}`,
      leftBehind: 'Tu as oublié quelque chose dans ton panier',
      subtitle: 'Tes arbres sont prêts à être plantés à Zacapa, Guatemala. Il ne reste qu\'une étape.',
      yourCart: 'Ton panier',
      completeOrder: 'Finaliser ma commande',
      impact: 'Ton impact potentiel',
      impactText: 'Avec ton adoption, une famille d\'agriculteurs au Guatemala aura des revenus stables et les enfants de Zacapa seront un pas plus près d\'avoir leur école.',
      footer: 'L\'équipe Quetz · hola@quetz.org',
      unsubscribe: 'Si tu ne souhaites pas recevoir ces rappels, tu peux ignorer cet email.',
    },
  };

  const t = translations[language] || translations.es;

  const itemsHtml = items.map(item => {
    const detail = item.type === 'subscription'
      ? `${item.treesPerMonth} árbol${(item.treesPerMonth || 0) > 1 ? 'es' : ''}/mes · €${item.price}/mes`
      : `x${item.quantity} · €${(item.price * (item.quantity || 1)).toFixed(2)}`;
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
          <span style="font-weight:600;color:#1a1a1a;">${item.name}</span>
          <br/>
          <span style="font-size:13px;color:#6b7280;">${detail}</span>
        </td>
      </tr>
    `;
  }).join('');

  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f7f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1a6b2e;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
              <img src="https://quetz.org/logo-quetz-oficial.png" alt="QUETZ" width="140" style="height:auto;margin-bottom:16px;" />
              <p style="color:#a7f3a0;font-size:14px;margin:0;letter-spacing:0.05em;text-transform:uppercase;">Raíces que cambian vidas</p>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 24px;">
              <h1 style="font-size:26px;font-weight:700;color:#1a1a1a;margin:0 0 12px;">
                ${t.leftBehind} 🌿
              </h1>
              <p style="font-size:16px;color:#4b5563;line-height:1.6;margin:0 0 24px;">
                ${t.greeting}! ${t.subtitle}
              </p>
            </td>
          </tr>

          <!-- Cart Items -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 24px;">
              <p style="font-size:14px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">
                ${t.yourCart}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
                <tr>
                  <td style="padding:16px 0 0;">
                    <span style="font-size:18px;font-weight:700;color:#1a6b2e;">Total: €${totalValue.toFixed(2)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 40px;text-align:center;">
              <a href="${cartUrl}" 
                 style="display:inline-block;background-color:#1a6b2e;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;margin-top:16px;">
                🌳 ${t.completeOrder}
              </a>
            </td>
          </tr>

          <!-- Impact -->
          <tr>
            <td style="background-color:#f0fdf4;border-top:2px solid #dcfce7;padding:32px 40px;">
              <h3 style="font-size:16px;font-weight:700;color:#1a6b2e;margin:0 0 8px;">
                🌍 ${t.impact}
              </h3>
              <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0;">
                ${t.impactText}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="font-size:13px;color:#9ca3af;margin:0 0 8px;">${t.footer}</p>
              <p style="font-size:12px;color:#d1d5db;margin:0;">${t.unsubscribe}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject: t.subject, html };
}

export async function POST(request: Request) {
  try {
    const body: AbandonedCartPayload = await request.json();

    // Verify secret to prevent unauthorized calls
    if (body.secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userEmail, userName, language, items, totalValue, cartUrl } = body;

    if (!userEmail || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { subject, html } = getEmailContent(userName, items, totalValue, cartUrl, language || 'es');

    await sendEmail(userEmail, subject, html);

    return NextResponse.json({ success: true, sentTo: userEmail });
  } catch (error) {
    console.error('Error sending cart reminder email:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
