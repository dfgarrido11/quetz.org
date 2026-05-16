export const dynamic = "force-dynamic";
export const maxDuration = 300; // Puppeteer needs time

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCertificatePdf, generateCertificateNumber } from "@/lib/certificates/generator";
import { sendEmail } from "@/lib/email";

interface EmployeeEntry {
  name: string;
  email?: string;
}

interface GenerateRequest {
  token: string;
  employees: EmployeeEntry[];
}

// Zacapa GPS area — slight variation per certificate for authenticity
const ZACAPA_BASE_LAT = 14.9514;
const ZACAPA_BASE_LNG = -89.5832;

function assignSpecies(index: number): "Kiefer" | "Zypresse" {
  // Alternate between the two species
  return index % 2 === 0 ? "Kiefer" : "Zypresse";
}

function assignGps(index: number): { lat: number; lng: number } {
  // Distribute GPS positions within Zacapa region (small offsets)
  const latOffset = (index % 10) * 0.0012;
  const lngOffset = Math.floor(index / 10) * 0.0015;
  return {
    lat: ZACAPA_BASE_LAT + latOffset,
    lng: ZACAPA_BASE_LNG + lngOffset,
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, employees } = body;

  if (!token || !Array.isArray(employees) || employees.length === 0) {
    return NextResponse.json({ error: "token and employees required" }, { status: 400 });
  }

  // Validate token
  const order = await prisma.giftOrder.findUnique({ where: { activationToken: token } });
  if (!order) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 404 });
  }
  if (order.status === "activated") {
    return NextResponse.json({ error: "Dieser Token wurde bereits verwendet" }, { status: 409 });
  }
  if (new Date() > order.tokenExpiresAt) {
    await prisma.giftOrder.update({ where: { id: order.id }, data: { status: "expired" } });
    return NextResponse.json({ error: "Token abgelaufen" }, { status: 410 });
  }
  if (employees.length !== order.treeCount) {
    return NextResponse.json(
      { error: `Anzahl der Mitarbeiter (${employees.length}) muss ${order.treeCount} entsprechen` },
      { status: 422 }
    );
  }

  const now = new Date();
  const generatedCerts: Array<{ employeeName: string; pdfUrl: string; email?: string }> = [];

  // Generate each certificate sequentially (Puppeteer is resource-intensive)
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const certNumber = await generateCertificateNumber(order.id);
    const gps = assignGps(i);
    const species = assignSpecies(i);

    const certData = {
      employeeName: emp.name,
      companyName: order.companyName,
      treeSpecies: species,
      certificateNumber: certNumber,
      plantedAt: now,
      issuedAt: now,
      gpsLat: gps.lat,
      gpsLng: gps.lng,
      qrUrl: `https://quetz.org/zertifikat/${certNumber}`,
    };

    const { pdfUrl } = await generateCertificatePdf(certData);

    // Save to DB
    await prisma.giftCertificate.create({
      data: {
        orderId: order.id,
        companyName: order.companyName,
        employeeName: emp.name,
        employeeEmail: emp.email ?? null,
        treeSpecies: species === "Kiefer" ? "pino" : "cipres",
        treeLatitude: gps.lat,
        treeLongitude: gps.lng,
        plantedAt: now,
        certificateNumber: certNumber,
        issuedAt: now,
        pdfUrl,
      },
    });

    generatedCerts.push({ employeeName: emp.name, pdfUrl, email: emp.email });
  }

  // Mark order as activated
  await prisma.giftOrder.update({
    where: { id: order.id },
    data: { status: "activated" },
  });

  // Send emails based on whether individual addresses were provided
  const hasEmails = generatedCerts.every((c) => c.email);

  if (hasEmails) {
    await sendIndividualEmails(generatedCerts, order.companyName);
  } else {
    await sendZipToCompany(order.companyEmail, order.companyName, generatedCerts);
  }

  return NextResponse.json({ success: true, count: generatedCerts.length });
}

async function sendIndividualEmails(
  certs: Array<{ employeeName: string; pdfUrl: string; email?: string }>,
  companyName: string
): Promise<void> {
  for (const cert of certs) {
    if (!cert.email) continue;

    const pdfAbsoluteUrl = `https://quetz.org${cert.pdfUrl}`;
    const html = buildEmployeeEmail(cert.employeeName, companyName, pdfAbsoluteUrl);

    try {
      await sendEmail(
        cert.email,
        `Ihr Adoptionszertifikat von ${companyName} | quetz.org`,
        html
      );
    } catch (err) {
      console.error(`[gift-certs] Failed to send email to ${cert.email}:`, err);
    }
  }
}

async function sendZipToCompany(
  companyEmail: string,
  companyName: string,
  certs: Array<{ employeeName: string; pdfUrl: string }>
): Promise<void> {
  const pdfList = certs
    .map((c, i) => `${i + 1}. ${c.employeeName}: https://quetz.org${c.pdfUrl}`)
    .join("\n");

  const html = buildCompanyEmail(companyName, pdfList, certs.length);

  try {
    await sendEmail(
      companyEmail,
      `Ihre ${certs.length} Adoptionszertifikate | quetz.org`,
      html
    );
  } catch (err) {
    console.error(`[gift-certs] Failed to send company email to ${companyEmail}:`, err);
  }
}

function buildEmployeeEmail(employeeName: string, companyName: string, pdfUrl: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Ihr Adoptionszertifikat</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:580px;">
        <tr><td style="background:#1B4332;padding:32px 40px;text-align:center;">
          <span style="font-size:22px;font-weight:bold;color:#52B788;letter-spacing:0.05em;">quetz.org</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#1B4332;font-size:22px;font-weight:bold;margin:0 0 16px;">Sehr geehrte(r) ${escapeHtmlEmail(employeeName)},</p>
          <p style="color:#374151;line-height:1.7;margin:0 0 16px;">
            im Namen von <strong>${escapeHtmlEmail(companyName)}</strong> wurde in Ihrem Namen ein Baum in Zacapa, Guatemala gepflanzt.
          </p>
          <p style="color:#374151;line-height:1.7;margin:0 0 24px;">
            Anbei finden Sie Ihr persönliches Adoptionszertifikat. Sie können es herunterladen, ausdrucken oder digital aufbewahren.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr><td style="background:#1B4332;border-radius:6px;padding:14px 28px;">
              <a href="${pdfUrl}" style="color:#ffffff;font-weight:bold;text-decoration:none;font-size:15px;">Zertifikat herunterladen (PDF)</a>
            </td></tr>
          </table>
          <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
            Mit freundlichen Grüßen,<br>
            Daniel Garrido<br>
            Gründer &amp; CEO, quetz.org<br>
            Düsseldorf-Unterbach, NRW
          </p>
        </td></tr>
        <tr><td style="background:#1B4332;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#52B788;">quetz.org &middot; Düsseldorf &middot; Im Auftrag von ${escapeHtmlEmail(companyName)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildCompanyEmail(companyName: string, pdfList: string, count: number): string {
  const listHtml = pdfList
    .split("\n")
    .map((line) => `<li style="margin-bottom:6px;font-size:13px;color:#374151;">${escapeHtmlEmail(line)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Ihre Adoptionszertifikate</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:580px;">
        <tr><td style="background:#1B4332;padding:32px 40px;text-align:center;">
          <span style="font-size:22px;font-weight:bold;color:#52B788;letter-spacing:0.05em;">quetz.org</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#1B4332;font-size:22px;font-weight:bold;margin:0 0 16px;">Sehr geehrtes Team von ${escapeHtmlEmail(companyName)},</p>
          <p style="color:#374151;line-height:1.7;margin:0 0 16px;">
            Ihre ${count} Adoptionszertifikate wurden erfolgreich generiert. Sie können die einzelnen PDFs über folgende Links herunterladen:
          </p>
          <ul style="padding-left:20px;margin:0 0 32px;">${listHtml}</ul>
          <p style="color:#374151;line-height:1.7;margin:0 0 24px;">
            Bei Fragen stehen wir Ihnen gerne zur Verfügung.
          </p>
          <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
            Mit freundlichen Grüßen,<br>
            Daniel Garrido<br>
            Gründer &amp; CEO, quetz.org<br>
            Düsseldorf-Unterbach, NRW
          </p>
        </td></tr>
        <tr><td style="background:#1B4332;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#52B788;">quetz.org &middot; Düsseldorf</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtmlEmail(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
