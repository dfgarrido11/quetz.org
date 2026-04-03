import nodemailer from 'nodemailer';

const ZOHO_SMTP_PASSWORD = process.env.ZOHO_SMTP_PASSWORD;

if (!ZOHO_SMTP_PASSWORD) {
  console.error('❌ ZOHO_SMTP_PASSWORD no está definida. Ejecútalo con:');
  console.error('   ZOHO_SMTP_PASSWORD=tu_contraseña npx tsx scripts/test-smtp.ts');
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
  console.log('🔌 Verificando conexión con smtp.zoho.eu:587 ...');

  try {
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada correctamente');
  } catch (err: any) {
    console.error('❌ Error de conexión SMTP:', err.message);
    process.exit(1);
  }

  console.log('📤 Enviando email de prueba desde hola@quetz.org ...');

  try {
    const info = await transporter.sendMail({
      from: '"Quetz Test" <hola@quetz.org>',
      to: 'dgarrido@quetz.org',
      subject: '[TEST] Prueba SMTP Zoho — Quetz',
      html: `
        <h2>Email de prueba — Quetz</h2>
        <p>Este es un email de prueba para verificar que el SMTP de Zoho funciona correctamente.</p>
        <ul>
          <li><strong>Remitente:</strong> hola@quetz.org</li>
          <li><strong>Host SMTP:</strong> smtp.zoho.eu:587</li>
          <li><strong>Fecha:</strong> ${new Date().toISOString()}</li>
        </ul>
        <p style="color:green">✅ Si ves este email, el SMTP está configurado correctamente.</p>
      `,
    });

    console.log('✅ Email enviado correctamente');
    console.log('   Message ID:', info.messageId);
    console.log('   Accepted:  ', info.accepted);
    console.log('   Rejected:  ', info.rejected);
  } catch (err: any) {
    console.error('❌ Error al enviar email:', err.message);
    process.exit(1);
  }
}

main();
