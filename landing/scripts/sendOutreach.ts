import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

const prisma = new PrismaClient();

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY no está definida');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

interface OutreachContact {
  email: string;
  name?: string;
  company?: string;
  position?: string;
  country?: string;
}

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📧 Quetz Outreach Campaign Tool

Uso:
  npm run outreach:create --name "Nombre de campaña" --subject "Asunto" --csv "ruta/al/archivo.csv"
  npm run outreach:send --campaign-id "campaign_id"
  npm run outreach:status --campaign-id "campaign_id"
  npm run outreach:test --email "test@example.com" --template "corporate" --lang "de"

Ejemplos:
  tsx scripts/sendOutreach.ts create --name "Q1 2024 Corporate Outreach" --subject "Reducir huella de carbono de tu empresa" --csv "data/corporate_leads.csv"
  tsx scripts/sendOutreach.ts send --campaign-id "clp123abc"
  tsx scripts/sendOutreach.ts status --campaign-id "clp123abc"
  tsx scripts/sendOutreach.ts test --email "daniel@example.com" --template "corporate" --lang "es"
  tsx scripts/sendOutreach.ts test --email "daniel@example.com" --template "corporate" --lang "de"
    `);
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case 'create':
      await createCampaign();
      break;
    case 'send':
      await sendCampaign();
      break;
    case 'status':
      await getCampaignStatus();
      break;
    case 'test':
      await sendTestEmail();
      break;
    default:
      console.error('❌ Comando no válido:', command);
      process.exit(1);
  }
}

async function createCampaign() {
  const args = process.argv.slice(3);
  const flags = parseFlags(args);

  const name = flags.name;
  const subject = flags.subject;
  const csvPath = flags.csv;

  if (!name || !subject || !csvPath) {
    console.error('❌ Faltan parámetros requeridos: --name, --subject, --csv');
    process.exit(1);
  }

  console.log('🔍 Leyendo archivo CSV...');

  try {
    const csvContent = readFileSync(csvPath, 'utf-8');
    const contacts: OutreachContact[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`📊 Encontrados ${contacts.length} contactos`);

    // Crear la campaña
    console.log('💾 Creando campaña en base de datos...');

    const template = getCorporateEmailTemplate();

    const campaign = await prisma.outreachCampaign.create({
      data: {
        name,
        subject,
        message: template.htmlContent,
        senderEmail: 'hola@quetz.org',
        senderName: 'Equipo Quetz',
        replyTo: 'hola@quetz.org',
        targetType: 'corporate',
        status: 'draft',
      },
    });

    console.log(`✅ Campaña creada con ID: ${campaign.id}`);

    // Crear los leads
    console.log('💾 Guardando contactos...');

    for (const contact of contacts) {
      if (!contact.email) {
        console.log(`⚠️  Saltando contacto sin email:`, contact);
        continue;
      }

      await prisma.outreachLead.create({
        data: {
          campaignId: campaign.id,
          email: contact.email,
          name: contact.name,
          company: contact.company,
          position: contact.position,
          country: contact.country,
        },
      });
    }

    console.log(`✅ Campaña "${name}" creada exitosamente`);
    console.log(`   ID: ${campaign.id}`);
    console.log(`   Contactos: ${contacts.length}`);
    console.log(`   Estado: draft`);
    console.log(`\nPara enviar la campaña, ejecuta:`);
    console.log(`tsx scripts/sendOutreach.ts send --campaign-id ${campaign.id}`);

  } catch (error) {
    console.error('❌ Error al crear campaña:', error);
    process.exit(1);
  }
}

async function sendCampaign() {
  const args = process.argv.slice(3);
  const flags = parseFlags(args);

  const campaignId = flags['campaign-id'];

  if (!campaignId) {
    console.error('❌ Falta parámetro requerido: --campaign-id');
    process.exit(1);
  }

  console.log(`📤 Iniciando envío de campaña: ${campaignId}`);

  try {
    // Buscar campaña
    const campaign = await prisma.outreachCampaign.findUnique({
      where: { id: campaignId },
      include: { outreachLeads: true },
    });

    if (!campaign) {
      console.error('❌ Campaña no encontrada');
      process.exit(1);
    }

    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      console.error('❌ La campaña debe estar en estado "draft" o "paused"');
      process.exit(1);
    }

    const pendingLeads = campaign.outreachLeads.filter(lead => lead.status === 'pending');

    if (pendingLeads.length === 0) {
      console.log('✅ No hay leads pendientes para enviar');
      return;
    }

    console.log(`📊 Enviando a ${pendingLeads.length} contactos...`);

    // Actualizar estado de campaña
    await prisma.outreachCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'sending',
        startedAt: new Date(),
      },
    });

    let sent = 0;
    let failed = 0;

    for (const lead of pendingLeads) {
      try {
        console.log(`📧 Enviando a ${lead.email}...`);

        // Detectar idioma automáticamente por país
        const language = detectLanguageByCountry(lead.country);

        // Obtener template en el idioma correcto
        const template = getCorporateEmailTemplate(language);
        const personalizedTemplate = personalizeEmail(template.htmlContent, {
          name: lead.name || (language === 'de' ? 'Liebe/r' : 'Estimado/a'),
          company: lead.company || (language === 'de' ? 'Ihr Unternehmen' : 'su empresa'),
          position: lead.position || '',
        });

        const personalizedHtml = personalizedTemplate;

        // Personalizar subject también con el idioma
        const personalizedSubject = personalizeEmail(template.subject, {
          name: lead.name || '',
          company: lead.company || (language === 'de' ? 'Ihr Unternehmen' : 'su empresa'),
          position: lead.position || '',
        });

        const { data, error } = await resend.emails.send({
          from: `${campaign.senderName} <${campaign.senderEmail}>`,
          to: [lead.email],
          subject: personalizedSubject,
          html: personalizedHtml,
          replyTo: campaign.replyTo || campaign.senderEmail,
          headers: {
            'X-Campaign-ID': campaignId,
            'X-Lead-ID': lead.id,
            'X-Language': language,
            'X-Country': lead.country || '',
          },
        });

        if (error) {
          console.error(`❌ Error enviando a ${lead.email}:`, error);
          failed++;
          continue;
        }

        // Actualizar lead
        await prisma.outreachLead.update({
          where: { id: lead.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            messageId: data?.id,
          },
        });

        sent++;
        console.log(`✅ Enviado a ${lead.email} (ID: ${data?.id})`);

        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error enviando a ${lead.email}:`, error);
        failed++;
      }
    }

    // Actualizar campaña
    await prisma.outreachCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        totalSent: sent,
      },
    });

    console.log(`\n✅ Campaña completada`);
    console.log(`   Enviados: ${sent}`);
    console.log(`   Fallidos: ${failed}`);

  } catch (error) {
    console.error('❌ Error durante el envío:', error);

    // Marcar campaña como pausada en caso de error
    await prisma.outreachCampaign.update({
      where: { id: campaignId },
      data: { status: 'paused' },
    });

    process.exit(1);
  }
}

async function getCampaignStatus() {
  const args = process.argv.slice(3);
  const flags = parseFlags(args);

  const campaignId = flags['campaign-id'];

  if (!campaignId) {
    console.error('❌ Falta parámetro requerido: --campaign-id');
    process.exit(1);
  }

  try {
    const campaign = await prisma.outreachCampaign.findUnique({
      where: { id: campaignId },
      include: {
        outreachLeads: true,
        _count: {
          select: { outreachLeads: true }
        }
      },
    });

    if (!campaign) {
      console.error('❌ Campaña no encontrada');
      process.exit(1);
    }

    const statusCounts = campaign.outreachLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`\n📊 Estado de Campaña: ${campaign.name}`);
    console.log(`   ID: ${campaign.id}`);
    console.log(`   Estado: ${campaign.status}`);
    console.log(`   Asunto: ${campaign.subject}`);
    console.log(`   Creada: ${campaign.createdAt.toLocaleDateString()}`);
    console.log(`   Total contactos: ${campaign._count.outreachLeads}`);
    console.log(`\n📈 Estadísticas:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    console.log(`   Total enviados: ${campaign.totalSent}`);

    if (campaign.startedAt) {
      console.log(`   Iniciado: ${campaign.startedAt.toLocaleString()}`);
    }
    if (campaign.completedAt) {
      console.log(`   Completado: ${campaign.completedAt.toLocaleString()}`);
    }

  } catch (error) {
    console.error('❌ Error consultando estado:', error);
    process.exit(1);
  }
}

async function sendTestEmail() {
  const args = process.argv.slice(3);
  const flags = parseFlags(args);

  const email = flags.email;
  const template = flags.template || 'corporate';
  const language = flags.language || flags.lang || 'es'; // Default español

  if (!email) {
    console.error('❌ Falta parámetro requerido: --email');
    process.exit(1);
  }

  console.log(`📧 Enviando email de prueba a: ${email} (idioma: ${language})`);

  try {
    const emailTemplate = getCorporateEmailTemplate(language);

    const getName = (lang: string) => {
      if (lang === 'de') return 'Liebe/r';
      if (lang === 'en') return 'Dear';
      return 'Estimado/a';
    };

    const getCompany = (lang: string) => {
      if (lang === 'de') return 'Ihr Unternehmen';
      if (lang === 'en') return 'your company';
      return 'su empresa';
    };

    const personalizedHtml = personalizeEmail(emailTemplate.htmlContent, {
      name: getName(language),
      company: getCompany(language),
      position: '',
    });

    const { data, error } = await resend.emails.send({
      from: language === 'de' ? 'Quetz Team <hola@quetz.org>' : 'Equipo Quetz <hola@quetz.org>',
      to: [email],
      subject: `[TEST] ${emailTemplate.subject}`,
      html: personalizedHtml,
      replyTo: 'hola@quetz.org',
    });

    if (error) {
      console.error('❌ Error enviando email de prueba:', error);
      process.exit(1);
    }

    console.log(`✅ Email de prueba enviado exitosamente (ID: ${data?.id})`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

function detectLanguageByCountry(country?: string): string {
  if (!country) return 'es'; // Default español

  const countryLower = country.toLowerCase();

  // Países de habla alemana
  if (countryLower.includes('alemania') || countryLower.includes('germany') ||
      countryLower.includes('deutschland') || countryLower.includes('austria') ||
      countryLower.includes('österreich') || countryLower.includes('suiza') ||
      countryLower.includes('switzerland') || countryLower.includes('schweiz')) {
    return 'de';
  }

  // Países de habla inglesa
  if (countryLower.includes('estados unidos') || countryLower.includes('united states') ||
      countryLower.includes('usa') || countryLower.includes('reino unido') ||
      countryLower.includes('united kingdom') || countryLower.includes('uk') ||
      countryLower.includes('canadá') || countryLower.includes('canada') ||
      countryLower.includes('australia') || countryLower.includes('nueva zelanda')) {
    return 'en';
  }

  // Países de habla francesa
  if (countryLower.includes('francia') || countryLower.includes('france') ||
      countryLower.includes('bélgica') || countryLower.includes('belgium') ||
      countryLower.includes('belgique')) {
    return 'fr';
  }

  // Default: español para España, México, América Latina, etc.
  return 'es';
}

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};

  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      flags[key] = value;
    }
  }

  return flags;
}

function personalizeEmail(template: string, data: { name: string; company: string; position: string }): string {
  return template
    .replace(/\{\{name\}\}/g, data.name)
    .replace(/\{\{company\}\}/g, data.company)
    .replace(/\{\{position\}\}/g, data.position);
}

function getCorporateEmailTemplate(language: string = 'es'): EmailTemplate {
  if (language === 'de') {
    return getCorporateEmailTemplateGerman();
  }
  if (language === 'en') {
    return getCorporateEmailTemplateEnglish();
  }
  return getCorporateEmailTemplateSpanish();
}

function getCorporateEmailTemplateSpanish(): EmailTemplate {
  return {
    subject: "Reducir la huella de carbono de {{company}} con reforestación en Guatemala",
    htmlContent: `
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
              <p style="color:#95d5b2; margin:8px 0 0; font-size:14px;">Reforestación empresarial con impacto social</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color:#1b4332; margin:0 0 16px; font-size:22px;">
                Hola {{name}},
              </h2>

              <p style="color:#4a4a4a; font-size:16px; line-height:1.6; margin:0 0 20px;">
                Me llamo Daniel y soy el fundador de <strong>Quetz</strong>. Nos especializamos en ayudar a empresas como {{company}} a <strong>reducir su huella de carbono</strong> a través de reforestación con impacto social en Guatemala.
              </p>

              <div style="background-color:#d8f3dc; border-radius:8px; padding:20px; margin:24px 0;">
                <h3 style="color:#1b4332; margin:0 0 12px; font-size:18px;">¿Por qué hablar con nosotros?</h3>
                <ul style="color:#2d6a4f; font-size:15px; line-height:1.8; margin:0; padding-left:20px;">
                  <li><strong>Impacto medible:</strong> Cada árbol captura 25kg de CO₂ anualmente</li>
                  <li><strong>Transparencia total:</strong> Fotos y updates del progreso</li>
                  <li><strong>💚 Esos niños nos necesitan:</strong> Ayudas a construir la escuela de Jumuzna para 120 niños</li>
                  <li><strong>RSE auténtica:</strong> Historias reales que puedes compartir</li>
                </ul>
              </div>

              <p style="color:#4a4a4a; font-size:16px; line-height:1.6; margin:0 0 20px;">
                Empresas como <strong>IKEA</strong>, <strong>Microsoft</strong> y <strong>Patagonia</strong> ya han integrado la reforestación en sus estrategias de sostenibilidad.
              </p>

              <div style="text-align:center; margin:28px 0;">
                <a href="https://quetz.org/empresas" style="background-color:#2d6a4f; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:600; display:inline-block;">
                  Ver cómo funciona para empresas 🌳
                </a>
              </div>

              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0;">
                ¿Te interesaría una llamada de 15 minutos para ver cómo Quetz podría ayudar a {{company}} con sus objetivos de sostenibilidad?
              </p>

              <br>
              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0;">
                Saludos cordiales,<br>
                <strong>Daniel</strong><br>
                Fundador, Quetz 🌱
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa; padding:24px 40px; border-top:1px solid #e9ecef;">
              <p style="color:#6c757d; font-size:13px; margin:0; text-align:center; line-height:1.6;">
                <a href="https://quetz.org" style="color:#2d6a4f; text-decoration:none;">quetz.org</a> ·
                <a href="mailto:hola@quetz.org" style="color:#2d6a4f; text-decoration:none;">hola@quetz.org</a> ·
                <a href="https://quetz.org/unsubscribe?email={{email}}" style="color:#6c757d; text-decoration:none; font-size:11px;">darse de baja</a>
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
    textContent: `
Hola {{name}},

Me llamo Daniel y soy el fundador de Quetz. Nos especializamos en ayudar a empresas como {{company}} a reducir su huella de carbono a través de reforestación con impacto social en Guatemala.

¿Por qué hablar con nosotros?
• Impacto medible: Cada árbol captura 25kg de CO₂ anualmente
• Transparencia total: Fotos y updates del progreso
• Impacto social: Apoyas a familias agricultoras guatemaltecas
• RSE auténtica: Historias reales que puedes compartir

Empresas como IKEA, Microsoft y Patagonia ya han integrado la reforestación en sus estrategias de sostenibilidad.

¿Te interesaría una llamada de 15 minutos para ver cómo Quetz podría ayudar a {{company}} con sus objetivos de sostenibilidad?

Saludos cordiales,
Daniel
Fundador, Quetz 🌱

https://quetz.org
hola@quetz.org
    `,
  };
}

function getCorporateEmailTemplateEnglish(): EmailTemplate {
  return {
    subject: "Reduce {{company}}'s carbon footprint through reforestation in Guatemala",
    htmlContent: `
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
              <p style="color:#95d5b2; margin:8px 0 0; font-size:14px;">Corporate reforestation with social impact</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color:#1b4332; margin:0 0 16px; font-size:22px;">
                Hello {{name}},
              </h2>

              <p style="color:#4a4a4a; font-size:16px; line-height:1.6; margin:0 0 20px;">
                My name is Daniel and I'm the founder of <strong>Quetz</strong>. We specialize in helping companies like {{company}} <strong>reduce their carbon footprint</strong> through reforestation with social impact in Guatemala.
              </p>

              <div style="background-color:#d8f3dc; border-radius:8px; padding:20px; margin:24px 0;">
                <h3 style="color:#1b4332; margin:0 0 12px; font-size:18px;">Why talk to us?</h3>
                <ul style="color:#2d6a4f; font-size:15px; line-height:1.8; margin:0; padding-left:20px;">
                  <li><strong>Measurable impact:</strong> Each tree captures 25kg of CO₂ annually</li>
                  <li><strong>Full transparency:</strong> Photos and progress updates</li>
                  <li><strong>💚 These children need us:</strong> Help build Jumuzna school for 120 children</li>
                  <li><strong>Authentic CSR:</strong> Real stories you can share</li>
                </ul>
              </div>

              <p style="color:#4a4a4a; font-size:16px; line-height:1.6; margin:0 0 20px;">
                Companies like <strong>IKEA</strong>, <strong>Microsoft</strong>, and <strong>Patagonia</strong> have already integrated reforestation into their sustainability strategies.
              </p>

              <div style="text-align:center; margin:28px 0;">
                <a href="https://quetz.org/empresas" style="background-color:#2d6a4f; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:600; display:inline-block;">
                  See how it works for companies 🌳
                </a>
              </div>

              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0;">
                Would you be interested in a 15-minute call to see how Quetz could help {{company}} with its sustainability goals?
              </p>

              <br>
              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0;">
                Best regards,<br>
                <strong>Daniel</strong><br>
                Founder, Quetz 🌱
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa; padding:24px 40px; border-top:1px solid #e9ecef;">
              <p style="color:#6c757d; font-size:13px; margin:0; text-align:center; line-height:1.6;">
                <a href="https://quetz.org" style="color:#2d6a4f; text-decoration:none;">quetz.org</a> ·
                <a href="mailto:hola@quetz.org" style="color:#2d6a4f; text-decoration:none;">hola@quetz.org</a> ·
                <a href="https://quetz.org/unsubscribe?email={{email}}" style="color:#6c757d; text-decoration:none; font-size:11px;">unsubscribe</a>
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
    textContent: `
Hello {{name}},

My name is Daniel and I'm the founder of Quetz. We specialize in helping companies like {{company}} reduce their carbon footprint through reforestation with social impact in Guatemala.

Why talk to us?
• Measurable impact: Each tree captures 25kg of CO₂ annually
• Full transparency: Photos and progress updates
• Social impact: Support Guatemalan farming families
• Authentic CSR: Real stories you can share

Companies like IKEA, Microsoft, and Patagonia have already integrated reforestation into their sustainability strategies.

Would you be interested in a 15-minute call to see how Quetz could help {{company}} with its sustainability goals?

Best regards,
Daniel
Founder, Quetz 🌱

https://quetz.org
hola@quetz.org
    `,
  };
}

function getCorporateEmailTemplateGerman(): EmailTemplate {
  return {
    subject: "Reduzierung des CO₂-Fußabdrucks von {{company}} durch Aufforstung in Guatemala",
    htmlContent: `
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
              <p style="color:#95d5b2; margin:8px 0 0; font-size:14px;">Unternehmens-Aufforstung mit sozialer Wirkung</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color:#1b4332; margin:0 0 16px; font-size:22px;">
                Hallo {{name}},
              </h2>

              <p style="color:#4a4a4a; font-size:16px; line-height:1.6; margin:0 0 20px;">
                Mein Name ist Daniel und ich bin der Gründer von <strong>Quetz</strong>. Wir spezialisieren uns darauf, Unternehmen wie {{company}} dabei zu helfen, <strong>ihren CO₂-Fußabdruck zu reduzieren</strong> durch Aufforstung mit sozialer Wirkung in Guatemala.
              </p>

              <div style="background-color:#d8f3dc; border-radius:8px; padding:20px; margin:24px 0;">
                <h3 style="color:#1b4332; margin:0 0 12px; font-size:18px;">Warum mit uns sprechen?</h3>
                <ul style="color:#2d6a4f; font-size:15px; line-height:1.8; margin:0; padding-left:20px;">
                  <li><strong>Messbare Wirkung:</strong> Jeder Baum bindet 25kg CO₂ jährlich</li>
                  <li><strong>Vollständige Transparenz:</strong> Fotos und Updates zum Fortschritt</li>
                  <li><strong>💚 Diese Kinder brauchen uns:</strong> Hilfe beim Bau der Jumuzna-Schule für 120 Kinder</li>
                  <li><strong>Authentische CSR:</strong> Echte Geschichten, die Sie teilen können</li>
                </ul>
              </div>

              <p style="color:#4a4a4a; font-size:16px; line-height:1.6; margin:0 0 20px;">
                Unternehmen wie <strong>IKEA</strong>, <strong>Microsoft</strong> und <strong>Patagonia</strong> haben bereits Aufforstung in ihre Nachhaltigkeitsstrategien integriert.
              </p>

              <div style="text-align:center; margin:28px 0;">
                <a href="https://quetz.org/empresas" style="background-color:#2d6a4f; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:600; display:inline-block;">
                  Erfahren Sie, wie es für Unternehmen funktioniert 🌳
                </a>
              </div>

              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0;">
                Würden Sie sich für ein 15-minütiges Gespräch interessieren, um zu sehen, wie Quetz {{company}} bei ihren Nachhaltigkeitszielen helfen könnte?
              </p>

              <br>
              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0;">
                Mit freundlichen Grüßen,<br>
                <strong>Daniel</strong><br>
                Gründer, Quetz 🌱
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa; padding:24px 40px; border-top:1px solid #e9ecef;">
              <p style="color:#6c757d; font-size:13px; margin:0; text-align:center; line-height:1.6;">
                <a href="https://quetz.org" style="color:#2d6a4f; text-decoration:none;">quetz.org</a> ·
                <a href="mailto:hola@quetz.org" style="color:#2d6a4f; text-decoration:none;">hola@quetz.org</a> ·
                <a href="https://quetz.org/unsubscribe?email={{email}}" style="color:#6c757d; text-decoration:none; font-size:11px;">abmelden</a>
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
    textContent: `
Hallo {{name}},

Mein Name ist Daniel und ich bin der Gründer von Quetz. Wir spezialisieren uns darauf, Unternehmen wie {{company}} dabei zu helfen, ihren CO₂-Fußabdruck zu reduzieren durch Aufforstung mit sozialer Wirkung in Guatemala.

Warum mit uns sprechen?
• Messbare Wirkung: Jeder Baum bindet 25kg CO₂ jährlich
• Vollständige Transparenz: Fotos und Updates zum Fortschritt
• Soziale Wirkung: Sie unterstützen guatemaltekische Bauernfamilien
• Authentische CSR: Echte Geschichten, die Sie teilen können

Unternehmen wie IKEA, Microsoft und Patagonia haben bereits Aufforstung in ihre Nachhaltigkeitsstrategien integriert.

Würden Sie sich für ein 15-minütiges Gespräch interessieren, um zu sehen, wie Quetz {{company}} bei ihren Nachhaltigkeitszielen helfen könnte?

Mit freundlichen Grüßen,
Daniel
Gründer, Quetz 🌱

https://quetz.org
hola@quetz.org
    `,
  };
}

main()
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });