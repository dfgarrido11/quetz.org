import type { Metadata } from "next";
import JsonLd from "../components/json-ld";

export const metadata: Metadata = {
  title: "Firmengeschenk | Bäume adoptieren für Ihr Team",
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

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Firmengeschenk Baumpakete",
  description:
    "Echte Bäume in Zacapa, Guatemala als Firmengeschenk. Personalisierte Zertifikate mit GPS-Koordinaten für jeden Mitarbeiter. Steuerlich absetzbar.",
  brand: { "@type": "Brand", name: "QUETZ" },
  image: "https://quetz.org/og-image.png",
  offers: [
    {
      "@type": "Offer",
      name: "Klein (10 Bäume)",
      price: "99",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: "https://quetz.org/firmengeschenk",
    },
    {
      "@type": "Offer",
      name: "Medium (25 Bäume)",
      price: "229",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: "https://quetz.org/firmengeschenk",
    },
    {
      "@type": "Offer",
      name: "Groß (50 Bäume)",
      price: "449",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: "https://quetz.org/firmengeschenk",
    },
    {
      "@type": "Offer",
      name: "XL (100 Bäume)",
      price: "849",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: "https://quetz.org/firmengeschenk",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Ist das wirklich steuerlich absetzbar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja. Als Sachbezug können Firmengeschenke bis 60 Euro pro Mitarbeiter steuer- und sozialversicherungsfrei gewährt werden (§8 Abs. 2 Satz 11 EStG). Sie erhalten eine ordentliche Rechnung für Ihre Buchhaltung.",
      },
    },
    {
      "@type": "Question",
      name: "Wie schnell erhalten meine Mitarbeiter die Zertifikate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Innerhalb von 48 Stunden nach Übermittlung der Namen. Bei Eilbestellungen auch schneller.",
      },
    },
    {
      "@type": "Question",
      name: "Können wir das Zertifikat mit unserem Firmenlogo personalisieren?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, ab dem Medium-Paket (25 Bäume) können Sie Ihr Logo und eine persönliche Nachricht auf dem Zertifikat platzieren.",
      },
    },
    {
      "@type": "Question",
      name: "Was passiert, wenn ein Baum nicht überlebt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wir garantieren eine Überlebensrate von über 85%. Sollte ein Baum eingehen, pflanzen wir kostenlos einen neuen.",
      },
    },
    {
      "@type": "Question",
      name: "Gibt es eine Rechnung für die Buchhaltung?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, Sie erhalten automatisch eine ordentliche Rechnung mit ausgewiesener Mehrwertsteuer per E-Mail.",
      },
    },
    {
      "@type": "Question",
      name: "Wo genau werden die Bäume gepflanzt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In Zacapa, Guatemala. Jeder Baum hat GPS-Koordinaten, die Sie auf Ihrem Zertifikat und in unserem Dashboard einsehen können.",
      },
    },
    {
      "@type": "Question",
      name: "Kann ich die Bäume auch als Kundengeschenk nutzen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolut. Viele Unternehmen verschenken Bäume an Kunden zum Jahresende, zu Jubiläen oder als Dankeschön nach Projektabschluss. Für Kundengeschenke gilt eine separate steuerliche Freigrenze von 50 Euro pro Person (§4 Abs. 5 Nr. 1 EStG).",
      },
    },
  ],
};

export default function FirmengeschenkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={faqJsonLd} />
      {children}
    </>
  );
}
