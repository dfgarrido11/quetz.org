import type { Metadata } from "next";
import JsonLd from "../components/json-ld";

export const metadata: Metadata = {
  title: "Gedenkbaum pflanzen | Ein lebendiges Andenken",
  description:
    "Pflanzen Sie einen Gedenkbaum in Erinnerung an einen geliebten Menschen. Ein echter Baum in Zacapa, Guatemala, mit persönlicher Urkunde, Foto und GPS-Koordinaten. Eine lebendige Alternative zu Trauerkranz und Blumen.",
  keywords: [
    "Gedenkbaum",
    "Trauerbaum",
    "Baum in Erinnerung pflanzen",
    "Gedenkbaum pflanzen lassen",
    "Baum als Andenken",
    "Spende statt Kranz",
    "Trauergeschenk",
    "lebendiges Andenken",
  ],
  alternates: { canonical: "/gedenkbaum" },
  openGraph: {
    url: "https://quetz.org/gedenkbaum",
    title: "Gedenkbaum pflanzen | Ein lebendiges Andenken | QUETZ",
    description:
      "Ein echter Baum in Zacapa, Guatemala, gepflanzt in Erinnerung an einen geliebten Menschen. Mit persönlicher Urkunde, Foto und GPS-Koordinaten.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QUETZ Gedenkbaum - Ein lebendiges Andenken",
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
  name: "Gedenkbaum",
  description:
    "Ein echter Baum in Zacapa, Guatemala, gepflanzt in Erinnerung an einen geliebten Menschen. Mit persönlicher Urkunde, Foto und exakten GPS-Koordinaten.",
  brand: { "@type": "Brand", name: "QUETZ" },
  image: "https://quetz.org/og-image.png",
  offers: {
    "@type": "Offer",
    price: "39",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: "https://quetz.org/gedenkbaum",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Ist der Gedenkbaum eine Grabstätte?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nein. Der Gedenkbaum ist keine Grabstätte und kein Friedhof. Er ist ein lebendiges Andenken: ein echter Baum in Zacapa, Guatemala, der in Erinnerung an einen geliebten Menschen gepflanzt wird und über Jahrzehnte wächst.",
      },
    },
    {
      "@type": "Question",
      name: "Was steht auf der Urkunde?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Die persönliche Urkunde enthält den Namen der Person, an die der Baum erinnert, das Pflanzdatum, die Baumart, ein Foto des Baumes und die exakten GPS-Koordinaten. Auf Wunsch ergänzen wir eine persönliche Widmung.",
      },
    },
    {
      "@type": "Question",
      name: "Wie schnell wird der Baum gepflanzt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Die Pflanzung erfolgt zeitnah nach Ihrer Bestellung durch lokale Familien in Zacapa. Sobald der Baum gepflanzt ist, erhalten Sie Ihre persönliche Urkunde mit Foto und GPS-Koordinaten per E-Mail, in der Regel innerhalb von 48 Stunden.",
      },
    },
    {
      "@type": "Question",
      name: "Kann ich den Baum besuchen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja. Ihr Baum hat exakte GPS-Koordinaten, die auf der Urkunde stehen. Sollten Sie einmal nach Guatemala reisen, können Sie ihn besuchen. Auch ohne Reise sehen Sie über die Koordinaten und das Foto genau, wo Ihr Baum steht.",
      },
    },
    {
      "@type": "Question",
      name: "Welche Baumarten gibt es?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wir pflanzen heimische Arten in Zacapa, Guatemala: unter anderem Kiefer, Zypresse, Zeder, Mahagoni, Kaffee, Kakao, Avocado, Mango und Zitrone. Jeder Baum wird von lokalen Familien gepflanzt und gepflegt und trägt zur CO2-Bindung bei.",
      },
    },
  ],
};

export default function GedenkbaumLayout({
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
