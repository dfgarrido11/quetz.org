export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { companyName, country, contactName, email, phone, employees, message } = await request.json();

    if (!companyName || !contactName || !email || !employees) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    }

    // Interne Benachrichtigung an das Team
    await sendEmail(
      'dgarrido@quetz.org',
      `Neue Unternehmensanfrage — ${companyName}`,
      `
        <h2>Neue Anfrage für ein Unternehmensangebot</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px;font-weight:bold">Unternehmen</td><td style="padding:6px">${companyName}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Land</td><td style="padding:6px">${country}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Ansprechpartner</td><td style="padding:6px">${contactName}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">E-Mail</td><td style="padding:6px">${email}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Telefon</td><td style="padding:6px">${phone || '—'}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Mitarbeiter</td><td style="padding:6px">${employees}</td></tr>
          <tr><td style="padding:6px;font-weight:bold">Nachricht</td><td style="padding:6px">${message || '—'}</td></tr>
        </table>
      `
    );

    // Bestätigung an den Kunden
    await sendEmail(
      email,
      'Wir haben Ihre Anfrage erhalten — Quetz',
      `
        <h2>Hallo, ${contactName}</h2>
        <p>Vielen Dank für Ihr Interesse am Nachhaltigkeitsprogramm von Quetz für Unternehmen.</p>
        <p>Wir haben Ihre Anfrage für <strong>${companyName}</strong> erhalten und werden uns innerhalb der nächsten 24–48 Stunden bei Ihnen melden.</p>
        <br/>
        <p>Das Team von Quetz</p>
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending corporate email:', error);
    return NextResponse.json({ error: 'Fehler beim Senden der Anfrage' }, { status: 500 });
  }
}
