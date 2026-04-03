import nodemailer from 'nodemailer';

const ZOHO_SMTP_PASSWORD = process.env.ZOHO_SMTP_PASSWORD;

if (!ZOHO_SMTP_PASSWORD) {
  console.error('❌ ZOHO_SMTP_PASSWORD no está definida');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.eu',
  port: 587,
  secure: false,
  auth: {
    user: 'hola@quetz.org',
    pass: ZOHO_SMTP_PASSWORD,
  },
});

async function main() {
  // Last customer found via Stripe API
  const toEmail = 'smac2503@gmail.com';
  const name = 'Silvia';
  const planName = 'Plan Café';
  const treesPerMonth = 1;

  console.log('🔌 Verificando conexión SMTP...');
  await transporter.verify();
  console.log('✅ Conexión SMTP verificada');

  console.log(`📧 Enviando email de bienvenida a ${toEmail}...`);

  const info = await transporter.sendMail({
    from: '"Quetz 🌱" <hola@quetz.org>',
    to: toEmail,
    subject: `¡Bienvenida a Quetz, ${name}! Tu árbol ya está en camino 🌱`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f5f5f0; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#2d6a4f; padding: 40px 40px 30px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:700;">🌱 Quetz</h1>
              <p style="color:#95d5b2; margin:8px 0 0; font-size:14px;">Bosques para el futuro</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color:#1b4332; margin:0 0 16px; font-size:22px;">
                ¡Bienvenida a la familia Quetz, ${name}! 🎉
              </h2>

              <p style="color:#4a4a4a; font-size:16px; line-height:1.6; margin:0 0 20px;">
                Gracias por tu apoyo. Tu suscripción al <strong>${planName}</strong> ya está activa y cada mes recibirás <strong>${treesPerMonth} árbol de café plantado</strong> en Guatemala — cuidado por una familia local y cultivando un futuro más verde.
              </p>

              <div style="background-color:#d8f3dc; border-radius:8px; padding:20px; margin:24px 0;">
                <h3 style="color:#1b4332; margin:0 0 12px; font-size:16px;">¿Qué pasa ahora?</h3>
                <ul style="color:#2d6a4f; font-size:15px; line-height:1.8; margin:0; padding-left:20px;">
                  <li>Un agricultor local cuidará tu árbol este mes</li>
                  <li>Recibirás actualizaciones con fotos de tu árbol</li>
                  <li>Tu árbol capturará CO₂ año tras año</li>
                  <li>Tu apoyo mensual sustenta a familias guatemaltecas</li>
                </ul>
              </div>

              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0 0 20px;">
                Puedes ver el estado de tu bosque y gestionar tu suscripción en cualquier momento:
              </p>

              <div style="text-align:center; margin:28px 0;">
                <a href="https://quetz.org/mi-bosque" style="background-color:#2d6a4f; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:600; display:inline-block;">
                  Ver mi bosque 🌳
                </a>
              </div>

              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0;">
                Si tienes cualquier pregunta, responde a este email o escríbenos a
                <a href="mailto:hola@quetz.org" style="color:#2d6a4f;">hola@quetz.org</a>.
                Estamos aquí para ayudarte.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa; padding:24px 40px; border-top:1px solid #e9ecef;">
              <p style="color:#6c757d; font-size:13px; margin:0; text-align:center; line-height:1.6;">
                Con cariño, el equipo de <strong>Quetz</strong> 🌱<br>
                <a href="https://quetz.org" style="color:#2d6a4f; text-decoration:none;">quetz.org</a> ·
                <a href="mailto:hola@quetz.org" style="color:#2d6a4f; text-decoration:none;">hola@quetz.org</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  console.log('\n✅ Email de bienvenida enviado correctamente');
  console.log(`   Para:       ${toEmail}`);
  console.log(`   Message ID: ${info.messageId}`);
  console.log(`   Aceptado:   ${info.accepted.join(', ')}`);
  if (info.rejected.length > 0) {
    console.log(`   Rechazado:  ${info.rejected.join(', ')}`);
  }
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
