import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSR Partner | QUETZ — Aufforstung für Unternehmen",
  description: "Nachhaltige Baumpatenschaften für deutsche Unternehmen. GPS-getrackt, CSRD-konform, steuerlich absetzbar.",
  alternates: { canonical: "/csr-partner" },
  openGraph: {
    url: "https://quetz.org/csr-partner",
    title: "CSR Partner | QUETZ",
    description: "Nachhaltige Baumpatenschaften für deutsche Unternehmen.",
  },
};

export default function CsrPartnerLayout(props: { children: React.ReactNode }) {
  return props.children;
}
