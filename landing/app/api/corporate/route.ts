export const dynamic = "force-dynamic";




import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Send notification email helper
async function sendNotification(params: {
  notificationId: string;
  recipientEmail: string;
  subject: string;
  body: string;
}) {
  try {
    const appUrl = process.env.NEXTAUTH_URL || 'https://quetz.org';
    const hostname = new URL(appUrl).hostname;

    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: params.notificationId,
        subject: params.subject,
        body: params.body,
        is_html: true,
        recipient_email: params.recipientEmail,
        sender_email: `noreply@${hostname}`,
        sender_alias: 'QUETZ',
      }),
    });

    const result = await response.json();
    if (!result.success && !result.notification_disabled) {
      console.error('Notification send failed:', result);
    }
    return result;
  } catch (err) {
    console.error('Error sending notification:', err);
    return { success: false };
  }
}

function buildWelcomeEmail(contactName: string, companyName: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #065f46, #047857); padding: 30px 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🌳 QUETZ</h1>
        <p style="color: #d1fae5; margin: 8px 0 0; font-size: 14px;">Raíces que cambian vidas</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #065f46; margin: 0 0 16px;">Hallo ${contactName},</h2>
        <p style="color: #374151; line-height: 1.7; font-size: 15px;">
          vielen Dank für Ihr Interesse an unserem CSR-Programm für <strong>${companyName}</strong>. Ihre Anfrage ist bei uns eingegangen und wird von unserem Team priorisiert bearbeitet.
        </p>
        <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="color: #065f46; margin: 0; font-weight: 600; font-size: 15px;">📋 Nächste Schritte:</p>
          <ol style="color: #374151; margin: 12px 0 0; padding-left: 20px; line-height: 2;">
            <li>Wir erstellen Ihnen ein maßgeschneidertes Angebot (innerhalb 24h)</li>
            <li>Optionaler Videocall zur Vorstellung des Programms</li>
            <li>Aktivierung Ihres Unternehmens-Waldes in Zacapa, Guatemala</li>
          </ol>
        </div>
        <h3 style="color: #065f46; margin: 24px 0 12px;">Was macht QUETZ einzigartig?</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; background: #ecfdf5; border-radius: 6px; text-align: center; width: 25%;">
              <div style="font-size: 24px;">🌿</div>
              <div style="color: #065f46; font-weight: 600; font-size: 13px;">9 Arten</div>
              <div style="color: #6b7280; font-size: 11px;">Tropische Vielfalt</div>
            </td>
            <td style="padding: 10px; background: #ecfdf5; border-radius: 6px; text-align: center; width: 25%;">
              <div style="font-size: 24px;">👨‍🌾</div>
              <div style="color: #065f46; font-weight: 600; font-size: 13px;">Direkt</div>
              <div style="color: #6b7280; font-size: 11px;">Bauernfamilien</div>
            </td>
            <td style="padding: 10px; background: #ecfdf5; border-radius: 6px; text-align: center; width: 25%;">
              <div style="font-size: 24px;">📍</div>
              <div style="color: #065f46; font-weight: 600; font-size: 13px;">GPS</div>
              <div style="color: #6b7280; font-size: 11px;">Jeder Baum</div>
            </td>
            <td style="padding: 10px; background: #ecfdf5; border-radius: 6px; text-align: center; width: 25%;">
              <div style="font-size: 24px;">🏫</div>
              <div style="color: #065f46; font-weight: 600; font-size: 13px;">30%</div>
              <div style="color: #6b7280; font-size: 11px;">Schulfonds</div>
            </td>
          </tr>
        </table>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://quetz.org/unternehmen" style="display: inline-block; background: linear-gradient(135deg, #059669, #047857); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Unser Programm ansehen →
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
          Bei Fragen können Sie jederzeit direkt antworten — David Garrido, Gründer von QUETZ, kümmert sich persönlich um Ihre Anfrage.
        </p>
      </div>
      <div style="background: #f9fafb; padding: 20px 24px; border-top: 1px solid #e5e7eb; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          QUETZ — Tropische Bäume adoptieren in Guatemala<br/>
          <a href="https://quetz.org" style="color: #059669;">quetz.org</a>
        </p>
      </div>
    </div>
  `;
}

function buildAdminAlertEmail(lead: {
  companyName: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  employeeCount: string | null;
  message: string | null;
}): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0;">🚨 Nuevo Lead Corporativo</h2>
      </div>
      <div style="padding: 24px; background: #fff;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 130px;">Empresa:</td><td style="padding: 8px 0; font-weight: 600;">${lead.companyName}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">País:</td><td style="padding: 8px 0;">${lead.country}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Contacto:</td><td style="padding: 8px 0;">${lead.contactName}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${lead.contactEmail}">${lead.contactEmail}</a></td></tr>
          ${lead.contactPhone ? `<tr><td style="padding: 8px 0; color: #6b7280;">Teléfono:</td><td style="padding: 8px 0;"><a href="tel:${lead.contactPhone}">${lead.contactPhone}</a></td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #6b7280;">Empleados:</td><td style="padding: 8px 0;">${lead.employeeCount || 'No especificado'}</td></tr>
        </table>
        ${lead.message ? `
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #059669;">
            <p style="color: #6b7280; margin: 0 0 8px; font-size: 13px;">Mensaje:</p>
            <p style="color: #374151; margin: 0;">${lead.message}</p>
          </div>
        ` : ''}
        <div style="margin-top: 24px; text-align: center;">
          <a href="mailto:${lead.contactEmail}?subject=QUETZ%20Corporate%20Program%20-%20${encodeURIComponent(lead.companyName)}" style="display: inline-block; background: #059669; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Responder ahora →
          </a>
        </div>
        <p style="color: #dc2626; font-size: 13px; text-align: center; margin-top: 16px;">
          ⏰ El lead ya recibió un email de bienvenida. Follow-up automático en 48h si no contactas.
        </p>
      </div>
    </div>
  `;
}

// POST - Create corporate lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, country, contactName, email, phone, employees, message } = body;

    // Validation
    if (!companyName || !country || !contactName || !email) {
      return NextResponse.json(
        { error: 'Campos requeridos: companyName, country, contactName, email' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Create lead
    const lead = await prisma.corporateLead.create({
      data: {
        companyName,
        country,
        contactName,
        contactEmail: email,
        contactPhone: phone || null,
        employeeCount: employees || null,
        message: message || null,
        status: 'new',
      },
    });

    // Send welcome email to the lead (non-blocking)
    sendNotification({
      notificationId: process.env.NOTIF_ID_CORPORATE_LEAD_WELCOME || '',
      recipientEmail: email,
      subject: `${contactName}, Ihre Anfrage bei QUETZ ist eingegangen`,
      body: buildWelcomeEmail(contactName, companyName),
    }).then(async (result) => {
      if (result?.success) {
        await prisma.corporateLead.update({
          where: { id: lead.id },
          data: { welcomeEmailSent: true },
        }).catch(() => {});
      }
    });

    // Alert David (non-blocking)
    sendNotification({
      notificationId: process.env.NOTIF_ID_CORPORATE_LEAD_NEW_SUBMISSION_ALERT || '',
      recipientEmail: 'dgarrido@quetz.org',
      subject: `🚨 Nuevo Lead: ${companyName} (${country})`,
      body: buildAdminAlertEmail({
        companyName,
        country,
        contactName,
        contactEmail: email,
        contactPhone: phone || null,
        employeeCount: employees || null,
        message: message || null,
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud recibida. Te contactaremos pronto.',
      leadId: lead.id,
    });
  } catch (error) {
    console.error('Error creating corporate lead:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// GET - List corporate leads (admin only)
export async function GET(request: NextRequest) {
  try {
    const leads = await prisma.corporateLead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error fetching corporate leads:', error);
    return NextResponse.json(
      { error: 'Error al obtener leads' },
      { status: 500 }
    );
  }
}
