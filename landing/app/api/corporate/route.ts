export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { companyName, country, contactName, email, phone, employees, message } = await request.json();

    if (!companyName || !contactName || !email || !employees) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Notificar al equipo interno
    await sendEmail(
      'dgarrido@quetz.org',
      `Nueva solicitud corporativa — ${companyName}`,
      `
        <h2>Nueva solicitud de propuesta corporativa</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px;font-weight:bold">Empresa</td><td style="padding:6px">${companyName}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">País</td><td style="padding:6px">${country}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Contacto</td><td style="padding:6px">${contactName}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Email</td><td style="padding:6px">${email}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Teléfono</td><td style="padding:6px">${phone || '—'}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Empleados</td><td style="padding:6px">${employees}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Mensaje</td><td style="padding:6px">${message || '—'}</td></tr>
        </table>
      `
    );

    // Confirmar al cliente
    await sendEmail(
      email,
      'Hemos recibido tu solicitud — Quetz',
      `
        <h2>Hola, ${contactName}</h2>
        <p>Gracias por tu interés en el programa de sostenibilidad corporativa de Quetz.</p>
        <p>Hemos recibido tu solicitud para <strong>${companyName}</strong> y nos pondremos en contacto contigo en las próximas 24–48 horas.</p>
        <br/>
        <p>El equipo de Quetz</p>
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending corporate email:', error);
    return NextResponse.json({ error: 'Error al enviar la solicitud' }, { status: 500 });
  }
}
