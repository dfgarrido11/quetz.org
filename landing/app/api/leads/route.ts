export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { nombre, email, pais } = await request.json();

    if (!nombre || !email || !pais) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Notificar al equipo interno
    await sendEmail(
      'dgarrido@quetz.org',
      `Nueva solicitud de demo — ${nombre}`,
      `
        <h2>Nueva solicitud de demo</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>País:</strong> ${pais}</p>
      `
    );

    // Confirmar al usuario
    await sendEmail(
      email,
      '¡Recibimos tu solicitud! — Quetz',
      `
        <h2>Hola, ${nombre}</h2>
        <p>Hemos recibido tu solicitud de demo personalizada. Nuestro equipo se pondrá en contacto contigo pronto.</p>
        <p>Gracias por tu interés en Quetz.</p>
        <br/>
        <p>El equipo de Quetz</p>
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
