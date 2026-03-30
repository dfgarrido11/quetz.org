import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: 'hola@quetz.org',
      pass: process.env.ZOHO_SMTP_PASSWORD,
    },
  });
  try {
    const { nombre, email, pais } = await request.json();

    if (!nombre || !email || !pais) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Notificar al equipo interno
    await transporter.sendMail({
      from: '"Quetz" <hola@quetz.org>',
      to: 'dgarrido@quetz.org',
      subject: `Nueva solicitud de demo — ${nombre}`,
      html: `
        <h2>Nueva solicitud de demo</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>País:</strong> ${pais}</p>
      `,
    });

    // Confirmar al usuario
    await transporter.sendMail({
      from: '"Quetz" <hola@quetz.org>',
      to: email,
      subject: '¡Recibimos tu solicitud! — Quetz',
      html: `
        <h2>Hola, ${nombre}</h2>
        <p>Hemos recibido tu solicitud de demo personalizada. Nuestro equipo se pondrá en contacto contigo pronto.</p>
        <p>Gracias por tu interés en Quetz.</p>
        <br/>
        <p>El equipo de Quetz</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
