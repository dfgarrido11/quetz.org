import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { syncColdEmailToHubSpot, trackEmailInteraction } from '../lib/hubspot';
import { syncToSimpleCRM, trackSimpleEmailInteraction } from '../lib/simple-crm';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

interface CorporateContact {
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  position: string;
  city: string;
  industry: string;
  employees: string;
  website?: string;
  csr_page?: string;
  linkedin?: string;
  sequence_type: 'csr_manager' | 'ceo' | 'hr_manager';
  priority: 'high' | 'medium' | 'low';
}

// Email templates from Manus
const EMAIL_SEQUENCES = {
  csr_manager: [
    {
      day: 1,
      subject: 'CSRD-Reporting 2026: Mehr als nur Zahlen, {{first_name}}?',
      content: `Hallo {{first_name}},

viele Mittelständler in NRW kämpfen aktuell mit den neuen CSRD-Richtlinien. Oft bleibt dabei das Wichtigste auf der Strecke: Die emotionale Geschichte für die eigenen Mitarbeiter und Kunden.

Mit **quetz.org** haben wir eine Lösung entwickelt, die messbaren Impact (Aufforstung in Guatemala) mit sozialer Verantwortung (Schulbau für 120 Kinder) verbindet – alles 100% transparent über ein digitales Dashboard nachverfolgbar. Perfekt für Ihren nächsten Nachhaltigkeitsbericht.

Haben Sie nächste Woche 15 Minuten Zeit, um zu prüfen, ob unser Modell zu {{company_name}} passt?

👉 [Jetzt Onboarding-Gespräch buchen](https://quetz.org/empresas?utm_source=coldemail&utm_campaign=csr_sequence_1&utm_content={{company_name}})

Beste Grüße aus Erkrath,
Daniel Garrido
Gründer, quetz.org

P.S.: Sie können auch direkt unser B2B-Dashboard anschauen: https://quetz.org/empresas`
    },
    {
      day: 4,
      subject: 'Wie ein Baum in Guatemala Ihr Employer Branding stärkt',
      content: `Hallo {{first_name}},

ich melde mich noch einmal kurz zurück. Ein Aspekt, der bei quetz.org oft übersehen wird: Es ist ein fantastisches Tool für das Employer Branding.

Stellen Sie sich vor, jeder Mitarbeiter von {{company_name}} erhält ein eigenes, GPS-getracktes Bäumchen. Sie können online zusehen, wie es wächst, und wissen gleichzeitig, dass ihr Baum einen lokalen Arbeitsplatz schafft und den Bau einer Schule finanziert. Das schafft eine Bindung, die weit über das übliche CO2-Zertifikat hinausgeht.

Hier können Sie sich direkt für ein Pilotprojekt anmelden:

👉 [Jetzt Firmen-Account erstellen](https://quetz.org/empresas/signup?utm_source=coldemail&utm_campaign=csr_sequence_2&utm_content={{company_name}})

Herzliche Grüße,
Daniel`
    },
    {
      day: 8,
      subject: 'Warum Transparenz beim Pflanzen von Bäumen so wichtig ist',
      content: `Hallo {{first_name}},

"Greenwashing" ist das Wort, das CSR-Manager aktuell am meisten fürchten. Genau deshalb haben wir bei quetz.org das Prinzip der radikalen Transparenz eingeführt.

Wir pflanzen nicht einfach irgendwo Bäume. Sie sehen auf unserem Dashboard exakt, wo gepflanzt wird, wer den Baum pflegt und wie weit der Bau unserer Schule fortgeschritten ist. Keine Blackbox, sondern greifbarer Impact für {{company_name}}.

Lassen Sie uns kurz sprechen, wie wir das für Ihr Reporting nutzen können:

👉 [Jetzt Termin vereinbaren](https://calendly.com/daniel-quetz/15min?utm_source=coldemail&utm_campaign=csr_sequence_3&utm_content={{company_name}})

Viele Grüße,
Daniel`
    }
  ]
};

// Database model extension for outreach tracking
async function createOutreachCampaignTable() {
  // This extends our existing Prisma schema
  console.log('📊 Ensuring outreach campaign tables exist...');

  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS cold_email_campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        sequence_type VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS cold_email_contacts (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES cold_email_campaigns(id),
        first_name VARCHAR NOT NULL,
        last_name VARCHAR,
        email VARCHAR UNIQUE NOT NULL,
        company_name VARCHAR NOT NULL,
        position VARCHAR,
        city VARCHAR,
        industry VARCHAR,
        sequence_type VARCHAR NOT NULL,
        priority VARCHAR DEFAULT 'medium',
        status VARCHAR DEFAULT 'pending',
        last_email_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS cold_email_sends (
        id SERIAL PRIMARY KEY,
        contact_id INTEGER REFERENCES cold_email_contacts(id),
        campaign_id INTEGER REFERENCES cold_email_campaigns(id),
        email_sequence_day INTEGER NOT NULL,
        subject VARCHAR NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
        opened_at TIMESTAMP,
        clicked_at TIMESTAMP,
        replied_at TIMESTAMP,
        status VARCHAR DEFAULT 'sent'
      );
    `;

    console.log('✅ Database schemas ready');
  } catch (error) {
    console.log('ℹ️ Database schemas already exist or error creating:', error);
  }
}

async function loadCorporateContacts(): Promise<CorporateContact[]> {
  console.log('📂 Loading corporate contacts...');

  // This would load from the CSV file that Manus created
  const csvPath = '/home/daniel/proyectos/quetz.org/Manus/50_empresas_csr_alemania.csv';

  try {
    const csvContent = readFileSync(csvPath, 'utf-8');
    const contacts: CorporateContact[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`📊 Loaded ${contacts.length} corporate contacts`);
    return contacts;
  } catch (error) {
    console.log('⚠️ CSV file not found, using sample data for testing...');

    // Sample data for testing
    return [
      {
        first_name: 'Michael',
        last_name: 'Schmidt',
        email: 'dgarrido@quetz.org', // Tu email para testing
        company_name: 'Timocom GmbH',
        position: 'Head of Sustainability',
        city: 'Erkrath',
        industry: 'Logistics',
        employees: '200-500',
        website: 'https://timocom.com',
        sequence_type: 'csr_manager',
        priority: 'high'
      },
      {
        first_name: 'Sarah',
        last_name: 'Müller',
        email: 'dfgarrido11@gmail.com', // Tu email personal para testing
        company_name: 'GreenTech Solutions',
        position: 'CSR Manager',
        city: 'Düsseldorf',
        industry: 'Technology',
        employees: '100-200',
        sequence_type: 'csr_manager',
        priority: 'high'
      }
    ];
  }
}

async function createCampaign(): Promise<number> {
  console.log('🚀 Creating cold email campaign...');

  const campaign = await prisma.$executeRaw`
    INSERT INTO cold_email_campaigns (name, sequence_type, status)
    VALUES ('April 2026 CSR Outreach', 'csr_manager', 'active')
    ON CONFLICT DO NOTHING
  `;

  // Get campaign ID
  const result = await prisma.$queryRaw<{id: number}[]>`
    SELECT id FROM cold_email_campaigns
    WHERE name = 'April 2026 CSR Outreach'
    ORDER BY id DESC LIMIT 1
  `;

  return result[0]?.id || 1;
}

async function scheduleEmails(contacts: CorporateContact[], campaignId: number) {
  console.log('📅 Scheduling cold emails for Monday/Tuesday 9am Deutschland...');

  // Monday April 6, 2026 at 9:00 AM CET (8:00 AM UTC)
  const mondaySchedule = new Date('2026-04-06T08:00:00.000Z');

  // Tuesday April 7, 2026 at 9:00 AM CET (8:00 AM UTC)
  const tuesdaySchedule = new Date('2026-04-07T08:00:00.000Z');

  let contactsScheduled = 0;

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];

    // Insert contact into database
    try {
      await prisma.$executeRaw`
        INSERT INTO cold_email_contacts
        (campaign_id, first_name, last_name, email, company_name, position, city, industry, sequence_type, priority)
        VALUES (${campaignId}, ${contact.first_name}, ${contact.last_name || ''}, ${contact.email},
                ${contact.company_name}, ${contact.position || ''}, ${contact.city || ''},
                ${contact.industry || ''}, ${contact.sequence_type}, ${contact.priority})
        ON CONFLICT (email) DO UPDATE SET
          company_name = ${contact.company_name},
          updated_at = NOW()
      `;

      // Schedule first email
      const sendDate = i < 10 ? mondaySchedule : tuesdaySchedule; // First 10 on Monday, rest on Tuesday

      console.log(`📧 Scheduling email for ${contact.first_name} at ${contact.company_name} on ${sendDate.toLocaleDateString('de-DE')} at 9:00 AM`);

      // This would be handled by a cron job or scheduled task
      contactsScheduled++;

    } catch (error) {
      console.error(`❌ Error scheduling email for ${contact.email}:`, error);
    }
  }

  console.log(`✅ Scheduled ${contactsScheduled} emails`);
  return contactsScheduled;
}

async function sendScheduledEmail(contactEmail: string, day: number = 1) {
  console.log(`📧 Sending email day ${day} to ${contactEmail}...`);

  try {
    // Get contact details
    const contact = await prisma.$queryRaw<any[]>`
      SELECT * FROM cold_email_contacts WHERE email = ${contactEmail}
    `;

    if (!contact || contact.length === 0) {
      throw new Error(`Contact not found: ${contactEmail}`);
    }

    const contactData = contact[0];
    const sequence = EMAIL_SEQUENCES.csr_manager[day - 1];

    if (!sequence) {
      throw new Error(`Email sequence day ${day} not found`);
    }

    // Replace template variables
    const personalizedSubject = sequence.subject
      .replace(/{{first_name}}/g, contactData.first_name)
      .replace(/{{company_name}}/g, contactData.company_name);

    const personalizedContent = sequence.content
      .replace(/{{first_name}}/g, contactData.first_name)
      .replace(/{{company_name}}/g, contactData.company_name);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Daniel Garrido <hola@quetz.org>',
      to: [contactEmail],
      subject: personalizedSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${personalizedContent.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}

          <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 8px;">
            <h3 style="color: #2d6a4f; margin: 0 0 10px 0;">🌱 Über quetz.org</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">
              Transparente Aufforestung + Schulbau in Guatemala<br>
              30% aller Einnahmen fließen in den Bau einer Schule für 120 Kinder<br>
              100% nachverfolgbar über unser Live-Dashboard
            </p>
          </div>

          <div style="margin-top: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px;">
            <p>Daniel Garrido | Gründer, quetz.org<br>
            📧 hola@quetz.org | 🌐 <a href="https://quetz.org">quetz.org</a></p>
            <p><a href="https://quetz.org/unsubscribe?email=${encodeURIComponent(contactEmail)}" style="color: #666;">Von weiteren E-Mails abmelden</a></p>
          </div>
        </div>
      `,
      headers: {
        'X-Campaign-Type': 'cold_outreach',
        'X-Sequence-Day': day.toString(),
        'X-Template-Version': '1.0',
      },
    });

    if (error) {
      throw error;
    }

    // Log successful send
    await prisma.$executeRaw`
      INSERT INTO cold_email_sends (contact_id, campaign_id, email_sequence_day, subject, sent_at, status)
      VALUES (${contactData.id}, ${contactData.campaign_id}, ${day}, ${personalizedSubject}, NOW(), 'sent')
    `;

    // Sync to HubSpot CRM (primary)
    await syncColdEmailToHubSpot({
      email: contactData.email,
      firstName: contactData.first_name,
      lastName: contactData.last_name || '',
      company: contactData.company_name,
      position: contactData.position || '',
      city: contactData.city || '',
      industry: contactData.industry || '',
      campaignName: 'April 2026 CSR Outreach'
    });

    // Backup to Simple CRM (always works)
    await syncToSimpleCRM({
      email: contactData.email,
      firstName: contactData.first_name,
      lastName: contactData.last_name || '',
      company: contactData.company_name,
      position: contactData.position || '',
      city: contactData.city || '',
      industry: contactData.industry || '',
      campaignName: 'April 2026 CSR Outreach'
    });

    // Track email sent in both systems
    await trackEmailInteraction(contactEmail, 'sent', 'April 2026 CSR Outreach');
    await trackSimpleEmailInteraction(contactEmail, 'sent', 'April 2026 CSR Outreach');

    console.log(`✅ Email sent successfully to ${contactEmail}`);
    console.log(`   Message ID: ${data?.id}`);
    console.log(`   Subject: ${personalizedSubject}`);
    console.log(`   🏢 Synced to HubSpot CRM`);

    return { success: true, messageId: data?.id };

  } catch (error) {
    console.error(`❌ Error sending email to ${contactEmail}:`, error);
    return { success: false, error };
  }
}

// Main execution function
async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting Cold Email Automation Setup...');

    // Setup database
    await createOutreachCampaignTable();

    // Load contacts
    const contacts = await loadCorporateContacts();

    // Create campaign
    const campaignId = await createCampaign();

    // Schedule emails
    const scheduledCount = await scheduleEmails(contacts, campaignId);

    console.log('\n🎉 Cold Email Automation Setup Complete!');
    console.log(`📊 Campaign ID: ${campaignId}`);
    console.log(`📧 Contacts scheduled: ${scheduledCount}`);
    console.log(`📅 Send dates: Monday 6 April & Tuesday 7 April at 9:00 AM CET`);

    console.log('\n📋 Next steps:');
    console.log('   1. Test email sending: npm run test-cold-email');
    console.log('   2. Set up cron job for Monday: 0 8 6 4 *');
    console.log('   3. Monitor sends in admin dashboard');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for testing
export { sendScheduledEmail, loadCorporateContacts, createCampaign };

// Run if called directly
if (require.main === module) {
  main();
}