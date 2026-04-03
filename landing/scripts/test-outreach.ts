import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface OutreachContact {
  email: string;
  name?: string;
  company?: string;
  position?: string;
  country?: string;
}

async function testCreateCampaign() {
  console.log('🧪 Probando creación de campaña sin Resend...');

  const csvPath = 'data/example-corporate-leads.csv';

  try {
    console.log('🔍 Leyendo archivo CSV...');

    const csvContent = readFileSync(csvPath, 'utf-8');
    const contacts: OutreachContact[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`📊 Encontrados ${contacts.length} contactos`);

    // Mostrar preview de contactos
    console.log(`📝 Preview de contactos:`);
    contacts.slice(0, 3).forEach((contact, i) => {
      console.log(`   ${i + 1}. ${contact.name} (${contact.email}) - ${contact.company}`);
    });

    // Crear la campaña
    console.log('💾 Creando campaña en base de datos...');

    const campaign = await prisma.outreachCampaign.create({
      data: {
        name: 'Test Campaign',
        subject: 'Prueba de sistema de outreach',
        message: '<html><body>Test message</body></html>',
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

    let createdCount = 0;
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
      createdCount++;
    }

    console.log(`✅ Prueba exitosa! Campaña "${campaign.name}" creada`);
    console.log(`   ID: ${campaign.id}`);
    console.log(`   Contactos creados: ${createdCount}`);
    console.log(`   Estado: ${campaign.status}`);

    // Consultar el estado
    const campaignWithLeads = await prisma.outreachCampaign.findUnique({
      where: { id: campaign.id },
      include: {
        outreachLeads: true,
        _count: {
          select: { outreachLeads: true }
        }
      },
    });

    console.log(`\n📊 Verificación final:`);
    console.log(`   Leads en BD: ${campaignWithLeads?._count.outreachLeads}`);
    console.log(`   Primer lead: ${campaignWithLeads?.outreachLeads[0]?.name} (${campaignWithLeads?.outreachLeads[0]?.email})`);

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    throw error;
  }
}

async function main() {
  try {
    await testCreateCampaign();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();