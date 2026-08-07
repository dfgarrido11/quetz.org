import type { Metadata } from "next";
import HomeClient from "./_components/HomeClient";
import JsonLd from "./components/json-ld";
import { getImpactStats } from "@/lib/impact-stats";
import { SUBSCRIPTION_PLANS } from "@/lib/plans";
import { translations } from "@/lib/translations";
import { FAQ_KEYS } from "@/lib/faq";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quetz.org";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "QUETZ",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-quetz-oficial.png`,
  email: "admin@quetz.org",
  description:
    "QUETZ verbindet Menschen und Unternehmen in Deutschland mit Aufforstung in Zacapa, Guatemala. Echte Bäume mit GPS-Koordinaten, Arbeit für lokale Familien und eine Schule für 120 Kinder.",
  // TODO-DANIEL: the LinkedIn URL 404s for anonymous requests — confirm the
  // real slug or drop it. Mirrored in SOCIAL_LINKS in app/components/footer.tsx.
  sameAs: [
    "https://instagram.com/quetzorg",
    "https://facebook.com/quetz.org",
    "https://www.linkedin.com/company/quetz",
  ],
};

/**
 * Product + Offer for the three subscription plans, priced from lib/plans.ts
 * so the structured data cannot drift from what checkout actually charges.
 */
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Baumpatenschaft in Zacapa, Guatemala",
  description:
    "Adoptiere einen Baum in Zacapa, Guatemala. Jeder Baum hat GPS-Koordinaten, schafft bezahlte Arbeit für lokale Familien und finanziert eine Schule für 120 Kinder.",
  image: `${SITE_URL}/og-image.png`,
  brand: { "@type": "Brand", name: "QUETZ" },
  offers: Object.values(SUBSCRIPTION_PLANS).map((plan) => ({
    "@type": "Offer",
    name: plan.nameDe,
    price: plan.priceMonthly.toFixed(2),
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/#planes`,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: plan.priceMonthly.toFixed(2),
      priceCurrency: "EUR",
      billingIncrement: 1,
      unitCode: "MON",
    },
  })),
};

/** Mirrors the rendered FAQ so the answers are eligible for rich results. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_KEYS.map((key) => ({
    "@type": "Question",
    name: translations.de[`faq.q${key}`],
    acceptedAnswer: {
      "@type": "Answer",
      text: translations.de[`faq.a${key}`],
    },
  })),
};

export default async function Home() {
  const stats = await getImpactStats();

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={productJsonLd} />
      <JsonLd data={faqJsonLd} />
      <HomeClient stats={stats} />
    </>
  );
}
