import type { Metadata } from "next";
import HomeClient from "./_components/HomeClient";
import JsonLd from "./components/json-ld";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "QUETZ",
  url: "https://quetz.org",
  logo: "https://quetz.org/logo-quetz-oficial.png",
  description:
    "QUETZ verbindet Menschen und Unternehmen in Deutschland mit Aufforstung in Zacapa, Guatemala. Echte Bäume mit GPS-Koordinaten, Arbeit für lokale Familien und eine Schule für 120 Kinder.",
  sameAs: ["https://www.linkedin.com/company/quetz"],
};

export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <HomeClient />
    </>
  );
}
