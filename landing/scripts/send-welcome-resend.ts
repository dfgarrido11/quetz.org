import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY no está definida en las variables de entorno');
  process.exit(1);
}

async function main() {
  console.log('🔍 Buscando el último usuario registrado...');

  // Get last adoption with user info
  const lastAdoption = await prisma.adoption.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      tree: true,
    },
  });

  if (!lastAdoption) {
    console.log('⚠️ No se encontraron adopciones en la base de datos');

    // Try subscriptions as fallback
    const lastSubscription = await prisma.subscription.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    if (!lastSubscription) {
      console.log('⚠️ No se encontraron subscripciones tampoco');
      process.exit(1);
    }

    console.log(`\n📋 Último usuario (por suscripción):`);
    console.log(`   Nombre: ${lastSubscription.user.name}`);
    console.log(`   Email:  ${lastSubscription.user.email}`);
    console.log(`   Plan:   ${lastSubscription.planName}`);
    console.log(`   Fecha:  ${lastSubscription.createdAt.toISOString()}`);

    await sendWelcomeEmailResend(
      lastSubscription.user.email,
      lastSubscription.user.name || 'Donante',
      lastSubscription.planName,
      1
    );
    return;
  }

  console.log(`\n📋 Último usuario (por adopción):`);
  console.log(`   Nombre:  ${lastAdoption.user.name}`);
  console.log(`   Email:   ${lastAdoption.user.email}`);
  console.log(`   Árbol:   ${lastAdoption.tree?.nameEs || 'N/A'}`);
  console.log(`   Cantidad: ${lastAdoption.quantity}`);
  console.log(`   Estado:  ${lastAdoption.status}`);
  console.log(`   Fecha:   ${lastAdoption.createdAt.toISOString()}`);

  await sendWelcomeEmailResend(
    lastAdoption.user.email,
    lastAdoption.user.name || 'Donante',
    lastAdoption.tree?.nameEs || 'Café',
    lastAdoption.quantity
  );
}

async function sendWelcomeEmailResend(
  toEmail: string,
  name: string,
  treeName: string,
  quantity: number
) {
  console.log(`📧 Enviando email de bienvenida a ${toEmail} usando Resend...`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Quetz 🌱 <hola@quetz.org>',
      to: [toEmail],
      subject: `¡Bienvenido/a a Quetz! Tu árbol ya está en camino 🌱`,
      replyTo: 'hola@quetz.org', // ✅ Reply-To configurado
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
                ¡Bienvenido/a a la familia Quetz, ${name}! 🎉
              </h2>

              <p style="color:#4a4a4a; font-size:16px; line-height:1.6; margin:0 0 20px;">
                Gracias por tu apoyo. Has adoptado <strong>${quantity} ${quantity === 1 ? 'árbol' : 'árboles'} de ${treeName}</strong> y ya estás contribuyendo a la reforestación en Guatemala y al sustento de familias rurales.
              </p>

              <div style="background-color:#d8f3dc; border-radius:8px; padding:20px; margin:24px 0;">
                <h3 style="color:#1b4332; margin:0 0 12px; font-size:16px;">¿Qué pasa ahora?</h3>
                <ul style="color:#2d6a4f; font-size:15px; line-height:1.8; margin:0; padding-left:20px;">
                  <li>Un agricultor local cuidará tu árbol</li>
                  <li>Recibirás actualizaciones periódicas con fotos</li>
                  <li>Tu árbol capturará CO₂ año tras año</li>
                  <li>Tu contribución apoya a familias guatemaltecas</li>
                  <li>Ayudas a construir la escuela de Jumuzna</li>
                </ul>
              </div>

              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0 0 20px;">
                Puedes ver el estado de tu bosque en cualquier momento iniciando sesión en tu cuenta:
              </p>

              <div style="text-align:center; margin:28px 0;">
                <a href="https://quetz.org/mi-bosque" style="background-color:#2d6a4f; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:600; display:inline-block;">
                  Ver mi bosque 🌳
                </a>
              </div>

              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0;">
                Si tienes cualquier pregunta, simplemente responde a este email. Estamos aquí para ayudarte.
              </p>

              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:16px 0 0;">
                Con cariño,<br>
                <strong>El equipo de Quetz</strong> 🌱
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa; padding:24px 40px; border-top:1px solid #e9ecef;">
              <p style="color:#6c757d; font-size:13px; margin:0; text-align:center; line-height:1.6;">
                <a href="https://quetz.org" style="color:#2d6a4f; text-decoration:none;">quetz.org</a> ·
                <a href="mailto:hola@quetz.org" style="color:#2d6a4f; text-decoration:none;">hola@quetz.org</a><br>
                <a href="https://quetz.org/unsubscribe?email=${encodeURIComponent(toEmail)}" style="color:#6c757d; text-decoration:none; font-size:11px;">Darse de baja</a>
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
      headers: {
        'X-Campaign-Type': 'welcome',
        'X-Template-Version': '1.0',
      },
    });

    if (error) {
      console.error('❌ Error enviando email con Resend:', error);
      process.exit(1);
    }

    console.log('\n✅ Email de bienvenida enviado correctamente con Resend');
    console.log(`   Para:       ${toEmail}`);
    console.log(`   Message ID: ${data?.id}`);
    console.log(`   ✅ Reply-To configurado: hola@quetz.org`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });