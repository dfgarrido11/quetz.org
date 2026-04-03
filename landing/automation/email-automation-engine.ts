import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import cron from 'node-cron';
import photoManager from './photo-manager';

const prisma = new PrismaClient();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SequenceStep {
  stepNumber: number;
  delay: number; // hours after previous step
  subject: string;
  template: string;
  attachImages?: boolean;
  ctaText: string;
  ctaUrl: string;
}

interface AutomationSequence {
  id: string;
  name: string;
  language: 'es' | 'en' | 'de' | 'fr';
  steps: SequenceStep[];
  targetIndustries: string[];
  minScore: number;
}

class EmailAutomationEngine {
  private sequences: Map<string, AutomationSequence> = new Map();

  constructor() {
    this.initializeSequences();
  }

  async startAutomation(): Promise<void> {
    console.log('🤖 Iniciando Email Automation Engine...');

    // Ejecutar cada 30 minutos para procesar colas de email
    cron.schedule('*/30 * * * *', async () => {
      await this.processEmailQueue();
    });

    // Ejecutar cada 2 horas para mover leads por sequences
    cron.schedule('0 */2 * * *', async () => {
      await this.advanceSequences();
    });

    // Ejecutar cada 6 horas para analizar respuestas
    cron.schedule('0 */6 * * *', async () => {
      await this.processReplies();
    });

    console.log('✅ Email Automation Engine configurado y corriendo...');
  }

  private initializeSequences(): void {
    // SECUENCIA ESPAÑOLA - Outreach inicial
    this.sequences.set('es-outreach', {
      id: 'es-outreach',
      name: 'Outreach Corporativo Español',
      language: 'es',
      targetIndustries: ['Technology', 'Manufacturing', 'Energy'],
      minScore: 60,
      steps: [
        {
          stepNumber: 1,
          delay: 0,
          subject: '🌱 {{company}}: Reducir huella de carbono con reforestación guatemalteca',
          template: 'spanish-outreach-1',
          attachImages: true,
          ctaText: '¿15 minutos esta semana?',
          ctaUrl: 'https://calendly.com/quetz/15min'
        },
        {
          stepNumber: 2,
          delay: 48, // 2 días después
          subject: 'Re: Reforestación {{company}} - Case study IKEA',
          template: 'spanish-followup-1',
          attachImages: false,
          ctaText: 'Ver cómo funciona',
          ctaUrl: 'https://quetz.org/casos-exito'
        },
        {
          stepNumber: 3,
          delay: 120, // 5 días después del primer email
          subject: '💚 {{company}}: Esos niños nos necesitan (última oportunidad)',
          template: 'spanish-emotional-close',
          attachImages: true,
          ctaText: 'Ayudar ahora',
          ctaUrl: 'https://calendly.com/quetz/15min'
        }
      ]
    });

    // SECUENCIA ALEMANA
    this.sequences.set('de-outreach', {
      id: 'de-outreach',
      name: 'Outreach Corporativo Alemán',
      language: 'de',
      targetIndustries: ['Technology', 'Manufacturing', 'Automotive'],
      minScore: 60,
      steps: [
        {
          stepNumber: 1,
          delay: 0,
          subject: '🌱 {{company}}: CO₂-Fußabdruck reduzieren mit Guatemala-Aufforstung',
          template: 'german-outreach-1',
          attachImages: true,
          ctaText: '15 Minuten diese Woche?',
          ctaUrl: 'https://calendly.com/quetz/15min'
        },
        {
          stepNumber: 2,
          delay: 48,
          subject: 'Re: Aufforstung {{company}} - Microsoft Fallstudie',
          template: 'german-followup-1',
          attachImages: false,
          ctaText: 'Funktionsweise ansehen',
          ctaUrl: 'https://quetz.org/unternehmen'
        },
        {
          stepNumber: 3,
          delay: 120,
          subject: '💚 {{company}}: Diese Kinder brauchen uns (letzte Chance)',
          template: 'german-emotional-close',
          attachImages: true,
          ctaText: 'Jetzt helfen',
          ctaUrl: 'https://calendly.com/quetz/15min'
        }
      ]
    });

    // SECUENCIA INGLESA
    this.sequences.set('en-outreach', {
      id: 'en-outreach',
      name: 'Corporate Outreach English',
      language: 'en',
      targetIndustries: ['Technology', 'Energy', 'Financial Services'],
      minScore: 60,
      steps: [
        {
          stepNumber: 1,
          delay: 0,
          subject: '🌱 {{company}}: Reduce carbon footprint with Guatemala reforestation',
          template: 'english-outreach-1',
          attachImages: true,
          ctaText: '15 minutes this week?',
          ctaUrl: 'https://calendly.com/quetz/15min'
        },
        {
          stepNumber: 2,
          delay: 48,
          subject: 'Re: {{company}} reforestation - Patagonia case study',
          template: 'english-followup-1',
          attachImages: false,
          ctaText: 'See how it works',
          ctaUrl: 'https://quetz.org/enterprise'
        },
        {
          stepNumber: 3,
          delay: 120,
          subject: '💚 {{company}}: These children need us (final opportunity)',
          template: 'english-emotional-close',
          attachImages: true,
          ctaText: 'Help now',
          ctaUrl: 'https://calendly.com/quetz/15min'
        }
      ]
    });
  }

  async enrollLeadInSequence(leadId: string, sequenceId: string): Promise<void> {
    try {
      const lead = await prisma.outreachLead.findUnique({
        where: { id: leadId },
        include: { automatedLead: true }
      });

      if (!lead) {
        console.error(`❌ Lead ${leadId} not found`);
        return;
      }

      const sequence = this.sequences.get(sequenceId);
      if (!sequence) {
        console.error(`❌ Sequence ${sequenceId} not found`);
        return;
      }

      // Verificar si lead cumple criterios de la secuencia
      if (lead.score < sequence.minScore) {
        console.log(`📊 Lead ${leadId} score too low (${lead.score} < ${sequence.minScore})`);
        return;
      }

      // Actualizar lead con secuencia
      await prisma.outreachLead.update({
        where: { id: leadId },
        data: {
          sequenceId: sequenceId,
          sequenceStep: 0,
          nextActionAt: new Date(), // Enviar primer email inmediatamente
          status: 'sequence_enrolled'
        }
      });

      console.log(`✅ Lead ${leadId} enrolled in sequence ${sequenceId}`);

    } catch (error) {
      console.error(`❌ Error enrolling lead ${leadId}:`, error);
    }
  }

  async processEmailQueue(): Promise<void> {
    try {
      console.log('📧 Procesando cola de emails automáticos...');

      // Buscar leads listos para próximo email
      const readyLeads = await prisma.outreachLead.findMany({
        where: {
          sequenceId: { not: null },
          nextActionAt: { lte: new Date() },
          status: { in: ['sequence_enrolled', 'email_sent'] }
        },
        include: { automatedLead: true },
        take: 20 // Procesar máximo 20 a la vez
      });

      console.log(`📮 Found ${readyLeads.length} leads ready for email`);

      for (const lead of readyLeads) {
        await this.sendNextSequenceEmail(lead);
      }

    } catch (error) {
      console.error('❌ Error processing email queue:', error);
    }
  }

  private async sendNextSequenceEmail(lead: any): Promise<void> {
    try {
      if (!lead.sequenceId) return;

      const sequence = this.sequences.get(lead.sequenceId);
      if (!sequence) return;

      const nextStepNumber = lead.sequenceStep + 1;
      const step = sequence.steps.find(s => s.stepNumber === nextStepNumber);

      if (!step) {
        // Secuencia completada
        await prisma.outreachLead.update({
          where: { id: lead.id },
          data: {
            status: 'sequence_completed',
            nextActionAt: null
          }
        });
        console.log(`✅ Sequence completed for lead ${lead.id}`);
        return;
      }

      // Generar email personalizado
      const emailContent = await this.generateSequenceEmail(lead, step);

      // Enviar email
      if (!resend) {
        console.log(`📧 [SIMULATION] Would send step ${nextStepNumber} to ${lead.email}`);
        return;
      }

      const { data, error } = await resend.emails.send({
        from: 'Daniel - Quetz <hola@quetz.org>',
        to: [lead.email],
        subject: emailContent.subject,
        html: emailContent.html,
        replyTo: 'hola@quetz.org',
        headers: {
          'X-Sequence-ID': lead.sequenceId,
          'X-Step': step.stepNumber.toString(),
          'X-Lead-ID': lead.id,
          'X-CTA': step.ctaText
        }
      });

      if (error) {
        console.error(`❌ Error sending email to ${lead.email}:`, error);
        return;
      }

      // Actualizar lead con próximo paso
      const nextStep = sequence.steps.find(s => s.stepNumber === nextStepNumber + 1);
      const nextActionDate = nextStep
        ? new Date(Date.now() + nextStep.delay * 60 * 60 * 1000)
        : null;

      await prisma.outreachLead.update({
        where: { id: lead.id },
        data: {
          sequenceStep: nextStepNumber,
          nextActionAt: nextActionDate,
          status: 'email_sent',
          sentAt: new Date(),
          messageId: data?.id
        }
      });

      console.log(`📧 Sent step ${nextStepNumber} to ${lead.email} (ID: ${data?.id})`);

      // Track metrics
      await this.trackSequenceMetrics(lead.sequenceId, 'email_sent');

    } catch (error) {
      console.error(`❌ Error sending sequence email to ${lead.id}:`, error);
    }
  }

  private async generateSequenceEmail(lead: any, step: SequenceStep): Promise<{subject: string, html: string}> {
    // Personalizar subject
    let subject = step.subject
      .replace('{{company}}', lead.company || lead.automatedLead?.company || 'su empresa')
      .replace('{{name}}', lead.name || 'Estimado/a');

    // Obtener template base
    let htmlTemplate = await this.getEmailTemplate(step.template);

    // Personalizar contenido
    htmlTemplate = htmlTemplate
      .replace(/{{name}}/g, lead.name || 'Estimado/a')
      .replace(/{{company}}/g, lead.company || lead.automatedLead?.company || 'su empresa')
      .replace(/{{position}}/g, lead.position || '')
      .replace(/{{ctaText}}/g, step.ctaText)
      .replace(/{{ctaUrl}}/g, step.ctaUrl);

    // Agregar fotos si es necesario
    if (step.attachImages) {
      const impactHTML = await photoManager.generateImpactHTML();
      htmlTemplate = htmlTemplate.replace('{{impactSection}}', impactHTML);
    } else {
      htmlTemplate = htmlTemplate.replace('{{impactSection}}', '');
    }

    return {
      subject,
      html: htmlTemplate
    };
  }

  private async getEmailTemplate(templateId: string): Promise<string> {
    // Templates dinámicos por idioma y tipo
    const templates: Record<string, string> = {
      'spanish-outreach-1': `
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
                Soy Daniel, fundador de <strong>Quetz</strong>. Ayudo a empresas como {{company}} a <strong>reducir su huella de carbono</strong> con reforestación verificable en Guatemala.
              </p>

              <div style="background-color:#d8f3dc; border-radius:8px; padding:20px; margin:24px 0;">
                <h3 style="color:#1b4332; margin:0 0 12px; font-size:18px;">¿Por qué hablar conmigo?</h3>
                <ul style="color:#2d6a4f; font-size:15px; line-height:1.8; margin:0; padding-left:20px;">
                  <li><strong>Impacto medible:</strong> Cada árbol captura 25kg de CO₂ anualmente</li>
                  <li><strong>Transparencia total:</strong> Fotos y updates del progreso</li>
                  <li><strong>💚 Esos niños nos necesitan:</strong> Ayudas a construir la escuela de 120 niños</li>
                  <li><strong>RSE auténtica:</strong> Historias reales que puedes compartir</li>
                </ul>
              </div>

              {{impactSection}}

              <div style="text-align:center; margin:28px 0;">
                <a href="{{ctaUrl}}" style="background-color:#2d6a4f; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:600; display:inline-block;">
                  {{ctaText}} 🌳
                </a>
              </div>

              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0;">
                Con cariño,<br>
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
                <a href="mailto:hola@quetz.org" style="color:#2d6a4f; text-decoration:none;">hola@quetz.org</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,

      'spanish-emotional-close': `
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

          <!-- Header Emocional -->
          <tr>
            <td style="background-color:#d73527; padding: 40px 40px 30px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:700;">💚 Esos niños nos necesitan</h1>
              <p style="color:#ffb3b3; margin:8px 0 0; font-size:14px;">Última oportunidad de unirte al proyecto</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color:#d73527; margin:0 0 16px; font-size:20px;">
                {{name}}, esto es personal...
              </h2>

              <p style="color:#4a4a4a; font-size:16px; line-height:1.6; margin:0 0 20px;">
                Te he escrito porque veo que {{company}} realmente se preocupa por el impacto social.
                Y ahora necesito tu ayuda para algo urgente.
              </p>

              {{impactSection}}

              <div style="background-color:#fff3cd; border-radius:8px; padding:20px; margin:24px 0; border-left: 4px solid #ffc107;">
                <h3 style="color:#856404; margin:0 0 12px; font-size:16px;">⏰ El tiempo se agota</h3>
                <p style="color:#856404; font-size:14px; margin:0; line-height:1.5;">
                  Solo quedan espacios para <strong>2 empresas más</strong> este trimestre.
                  La temporada de plantación en Guatemala termina en mayo.
                </p>
              </div>

              <div style="text-align:center; margin:28px 0;">
                <a href="{{ctaUrl}}" style="background-color:#d73527; color:#ffffff; text-decoration:none; padding:16px 40px; border-radius:8px; font-size:16px; font-weight:700; display:inline-block; box-shadow: 0 4px 8px rgba(215,53,39,0.3);">
                  💚 {{ctaText}}
                </a>
              </div>

              <p style="color:#4a4a4a; font-size:14px; line-height:1.5; margin:0; text-align:center; font-style:italic;">
                "Si no es ahora, ¿cuándo? Si no eres tú, ¿quién?"
              </p>

              <br>
              <p style="color:#4a4a4a; font-size:15px; line-height:1.6; margin:0;">
                Con esperanza,<br>
                <strong>Daniel</strong> 🌱<br>
                <em>Por los niños de Jumuzna</em>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,

      // Templates similares para alemán e inglés...
      'german-outreach-1': `<!-- Template alemán -->`,
      'english-outreach-1': `<!-- Template inglés -->`
    };

    return templates[templateId] || templates['spanish-outreach-1'];
  }

  async advanceSequences(): Promise<void> {
    console.log('📈 Advancing automation sequences...');

    // Buscar leads automáticos que necesitan ser añadidos a secuencias
    const newAutoLeads = await prisma.automatedLead.findMany({
      where: {
        status: 'enriched',
        score: { gte: 60 },
        contactedAt: null
      },
      take: 10
    });

    for (const autoLead of newAutoLeads) {
      await this.enrollAutoLeadInSequence(autoLead);
    }
  }

  private async enrollAutoLeadInSequence(autoLead: any): Promise<void> {
    try {
      // Detectar idioma por país
      const language = this.detectLanguage(autoLead.country);
      const sequenceId = `${language}-outreach`;

      // Crear outreach lead
      const outreachLead = await prisma.outreachLead.create({
        data: {
          campaignId: 'auto-campaign', // Crear campaña automática
          email: autoLead.emailsFound[0] || `info@${autoLead.domain}`,
          name: 'Decision Maker',
          company: autoLead.company,
          country: autoLead.country,
          automatedLeadId: autoLead.id,
          score: autoLead.score
        }
      });

      // Enrollar en secuencia
      await this.enrollLeadInSequence(outreachLead.id, sequenceId);

      // Marcar auto lead como contactado
      await prisma.automatedLead.update({
        where: { id: autoLead.id },
        data: {
          status: 'contacted',
          contactedAt: new Date()
        }
      });

      console.log(`🎯 Auto-enrolled ${autoLead.company} in ${sequenceId} sequence`);

    } catch (error) {
      console.error(`❌ Error enrolling auto lead ${autoLead.id}:`, error);
    }
  }

  private detectLanguage(country?: string): 'es' | 'en' | 'de' | 'fr' {
    if (!country) return 'es';

    const countryLower = country.toLowerCase();

    if (countryLower.includes('germany') || countryLower.includes('alemania')) return 'de';
    if (countryLower.includes('united states') || countryLower.includes('usa')) return 'en';
    if (countryLower.includes('france') || countryLower.includes('francia')) return 'fr';

    return 'es';
  }

  async processReplies(): Promise<void> {
    console.log('💬 Processing email replies...');
    // En producción: integrar con webhook de Resend para procesar replies automáticamente
    // Por ahora: placeholder para futuro desarrollo
  }

  private async trackSequenceMetrics(sequenceId: string, event: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Actualizar métricas diarias
      await prisma.automationMetrics.upsert({
        where: { date: new Date(today) },
        update: {
          emailsSent: { increment: event === 'email_sent' ? 1 : 0 }
        },
        create: {
          date: new Date(today),
          emailsSent: event === 'email_sent' ? 1 : 0
        }
      });

    } catch (error) {
      console.error('Error tracking metrics:', error);
    }
  }

  async getSequencePerformance(sequenceId: string): Promise<any> {
    const leads = await prisma.outreachLead.findMany({
      where: { sequenceId },
      select: {
        status: true,
        sequenceStep: true,
        sentAt: true,
        openedAt: true,
        clickedAt: true,
        repliedAt: true
      }
    });

    const total = leads.length;
    const sent = leads.filter(l => l.sentAt).length;
    const opened = leads.filter(l => l.openedAt).length;
    const clicked = leads.filter(l => l.clickedAt).length;
    const replied = leads.filter(l => l.repliedAt).length;

    return {
      total,
      sent,
      opened,
      clicked,
      replied,
      openRate: sent > 0 ? (opened / sent * 100).toFixed(1) : 0,
      clickRate: sent > 0 ? (clicked / sent * 100).toFixed(1) : 0,
      replyRate: sent > 0 ? (replied / sent * 100).toFixed(1) : 0
    };
  }

  async generatePerformanceReport(): Promise<string> {
    const sequences = ['es-outreach', 'de-outreach', 'en-outreach'];
    let report = `
🤖 EMAIL AUTOMATION PERFORMANCE REPORT

📅 Generated: ${new Date().toLocaleString()}

`;

    for (const seqId of sequences) {
      const perf = await this.getSequencePerformance(seqId);
      report += `
📊 ${seqId.toUpperCase()}:
   Total leads: ${perf.total}
   Emails sent: ${perf.sent}
   Open rate: ${perf.openRate}%
   Click rate: ${perf.clickRate}%
   Reply rate: ${perf.replyRate}%

`;
    }

    return report;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const engine = new EmailAutomationEngine();

  engine.startAutomation()
    .then(() => {
      console.log('✅ Email automation started');
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export default EmailAutomationEngine;