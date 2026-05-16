import fs from "fs";
import path from "path";
import QRCode from "qrcode";

interface CertificateData {
  employeeName: string;
  companyName: string;
  treeSpecies: "Kiefer" | "Zypresse";
  certificateNumber: string;
  plantedAt: Date;
  issuedAt: Date;
  gpsLat: number;
  gpsLng: number;
  /** URL to link the QR code to, e.g. https://quetz.org/baum/{treeId} */
  qrUrl: string;
}

interface GeneratedCertificate {
  pdfPath: string;
  pdfUrl: string;
}

function formatGermanDate(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatGps(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";

  const absLat = Math.abs(lat);
  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);
  const latSec = Math.round(((absLat - latDeg) * 60 - latMin) * 60);

  const absLng = Math.abs(lng);
  const lngDeg = Math.floor(absLng);
  const lngMin = Math.floor((absLng - lngDeg) * 60);
  const lngSec = Math.round(((absLng - lngDeg) * 60 - lngMin) * 60);

  return `${latDeg}${String.fromCharCode(176)}${latMin}'${latSec}" ${latDir}, ${lngDeg}${String.fromCharCode(176)}${lngMin}'${lngSec}" ${lngDir}`;
}

function getLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo-quetz-oficial.png");
    const buffer = fs.readFileSync(logoPath);
    return buffer.toString("base64");
  } catch {
    return "";
  }
}

function buildCertificateHtml(data: CertificateData, qrBase64: string): string {
  const templatePath = path.join(process.cwd(), "lib", "certificates", "template.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  const logoBase64 = getLogoBase64();
  const gps = formatGps(data.gpsLat, data.gpsLng);

  html = html
    .replace(/\{\{EMPLOYEE_NAME\}\}/g, escapeHtml(data.employeeName))
    .replace(/\{\{COMPANY_NAME\}\}/g, escapeHtml(data.companyName))
    .replace(/\{\{TREE_SPECIES\}\}/g, escapeHtml(data.treeSpecies))
    .replace(/\{\{CERTIFICATE_NUMBER\}\}/g, escapeHtml(data.certificateNumber))
    .replace(/\{\{PLANTED_DATE\}\}/g, formatGermanDate(data.plantedAt))
    .replace(/\{\{ISSUED_DATE\}\}/g, formatGermanDate(data.issuedAt))
    .replace(/\{\{GPS_COORDINATES\}\}/g, gps)
    .replace(/\{\{QR_CODE_BASE64\}\}/g, qrBase64)
    .replace(/\{\{LOGO_BASE64\}\}/g, logoBase64);

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// NOTE: PDFs are written to /public/certificates/ at runtime.
// On Railway/serverless deployments, this directory is ephemeral.
// For persistence, replace the fs.writeFileSync call below with
// an upload to Supabase Storage or R2, and return the public URL.
export async function generateCertificatePdf(
  data: CertificateData
): Promise<GeneratedCertificate> {
  // Generate QR code as base64 PNG
  const qrBase64 = await QRCode.toDataURL(data.qrUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#1B4332", light: "#FFFFFF" },
  });
  // Strip the data URI prefix
  const qrImageBase64 = qrBase64.replace("data:image/png;base64,", "");

  const html = buildCertificateHtml(data, qrImageBase64);

  // Dynamic import of puppeteer to avoid issues in edge environments
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.setViewport({ width: 794, height: 1123 });

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), "public", "certificates");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const safeNum = data.certificateNumber.replace(/[^A-Z0-9-]/g, "");
    const fileName = `${safeNum}.pdf`;
    const pdfPath = path.join(outputDir, fileName);

    await page.pdf({
      path: pdfPath,
      width: "794px",
      height: "1123px",
      printBackground: true,
    });

    return {
      pdfPath,
      pdfUrl: `/certificates/${fileName}`,
    };
  } finally {
    await browser.close();
  }
}

export async function generateCertificateNumber(orderId: string): Promise<string> {
  const { prisma } = await import("@/lib/prisma");
  const year = new Date().getFullYear();

  // Count existing certificates to get next sequence number
  const count = await prisma.giftCertificate.count();
  const seq = String(count + 1).padStart(5, "0");
  return `QZ-${year}-${seq}`;
}
