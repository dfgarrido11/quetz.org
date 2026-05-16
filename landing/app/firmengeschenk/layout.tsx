import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Firmengeschenk | Bäume adoptieren für Ihr Team | QUETZ",
  description:
    "Das Firmengeschenk, das wächst. Adoptieren Sie echte Bäume in Zacapa, Guatemala für Ihr Team. Ab 99€ für 10 Bäume. Personalisierte Zertifikate, steuerlich absetzbar.",
  keywords: [
    "Firmengeschenk nachhaltig",
    "Mitarbeitergeschenk Bäume",
    "nachhaltige Firmengeschenke",
    "Baum adoptieren Unternehmen",
    "Firmengeschenk mit Impact",
    "Sachbezug Mitarbeiter",
    "Weihnachtsgeschenk Firma nachhaltig",
    "Teamgeschenk nachhaltig",
    "CSR Geschenk",
    "Baumadoption Firma",
  ],
  alternates: { canonical: "/firmengeschenk" },
  openGraph: {
    url: "https://quetz.org/firmengeschenk",
    title: "Firmengeschenk | Bäume adoptieren für Ihr Team | QUETZ",
    description:
      "Adoptieren Sie echte Bäume in Guatemala als Firmengeschenk. Ab 99€. Personalisierte Zertifikate für jeden Mitarbeiter.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QUETZ Firmengeschenk - Bäume adoptieren",
      },
    ],
    type: "website",
    locale: "de_DE",
    siteName: "QUETZ",
  },
};

export default function FirmengeschenkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
