import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { number: string };
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

  return `${latDeg}\u00b0${latMin}'${latSec}" ${latDir}, ${lngDeg}\u00b0${lngMin}'${lngSec}" ${lngDir}`;
}

export default async function ZertifikatPage({ params }: Props) {
  const cert = await prisma.giftCertificate.findUnique({
    where: { certificateNumber: params.number },
    include: { order: { select: { companyName: true } } },
  });

  if (!cert) notFound();

  const speciesLabel = cert.treeSpecies === "pino" ? "Kiefer" : "Zypresse";
  const gps = formatGps(cert.treeLatitude, cert.treeLongitude);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FAFAF7",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 16px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          background: "#FFFFFF",
          border: "1px solid #D4C99A",
          borderRadius: 4,
          padding: "48px 40px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              color: "#7A7A7A",
              textTransform: "uppercase",
              fontFamily: "Arial, sans-serif",
              marginBottom: 16,
            }}
          >
            quetz.org
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#1B4332",
              margin: "0 0 8px",
              letterSpacing: "0.04em",
            }}
          >
            Adoptionszertifikat
          </h1>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              color: "#C9A84C",
              textTransform: "uppercase",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Baumpatenschaft &nbsp;&middot;&nbsp; Zacapa, Guatemala
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid #D4C99A",
            margin: "0 0 32px",
          }}
        />

        {/* Employee name */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              color: "#9CA3AF",
              textTransform: "uppercase",
              fontFamily: "Arial, sans-serif",
              marginBottom: 8,
            }}
          >
            Ausgestellt für
          </div>
          <div
            style={{
              fontSize: 26,
              fontStyle: "italic",
              color: "#1B4332",
              fontWeight: 500,
            }}
          >
            {cert.employeeName}
          </div>
        </div>

        {/* Data grid */}
        <div
          style={{
            background: "#F5ECD5",
            border: "1px solid #D4C99A",
            borderRadius: 2,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            marginBottom: 32,
          }}
        >
          {[
            { label: "Baumart", value: speciesLabel, mono: false },
            { label: "Pflanzdatum", value: formatGermanDate(cert.plantedAt), mono: false },
            { label: "GPS-Koordinaten", value: gps, mono: true },
            { label: "Zertifikatsnummer", value: cert.certificateNumber, mono: true },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                padding: "14px 18px",
                borderRight: i % 2 === 0 ? "1px solid #D4C99A" : "none",
                borderBottom: i < 2 ? "1px solid #D4C99A" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  fontFamily: "Arial, sans-serif",
                  marginBottom: 4,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: item.mono ? 12 : 14,
                  color: "#1A1A1A",
                  fontFamily: item.mono ? "Courier New, monospace" : "Georgia, serif",
                  fontStyle: item.label === "Baumart" ? "italic" : "normal",
                  fontWeight: item.label === "Baumart" ? 500 : 400,
                  color: item.label === "Baumart" ? "#1B4332" : "#1A1A1A",
                } as React.CSSProperties}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Download button */}
        {cert.pdfUrl && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <a
              href={cert.pdfUrl}
              download
              style={{
                display: "inline-block",
                background: "#1B4332",
                color: "#FFFFFF",
                textDecoration: "none",
                fontFamily: "Arial, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                padding: "12px 28px",
                borderRadius: 4,
                letterSpacing: "0.04em",
              }}
            >
              Zertifikat herunterladen (PDF)
            </a>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #E5E7EB",
            paddingTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#9CA3AF",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "0.08em",
            }}
          >
            quetz.org &middot; Düsseldorf
            {cert.order?.companyName && ` \u00b7 Im Auftrag von ${cert.order.companyName}`}
          </div>
          <Link
            href="/firmengeschenk"
            style={{
              fontSize: 11,
              color: "#C9A84C",
              textDecoration: "none",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "0.08em",
            }}
          >
            Firmengeschenke
          </Link>
        </div>
      </div>
    </main>
  );
}
