import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum von QUETZ gemäß § 5 TMG und § 18 Abs. 2 MStV: Anbieterkennzeichnung, Kontakt, Registerangaben, Haftungs- und Urheberrechtshinweise.",
  alternates: { canonical: "/impressum" },
  robots: { index: true, follow: true },
  openGraph: {
    url: "https://quetz.org/impressum",
    title: "Impressum | QUETZ",
    description:
      "Anbieterkennzeichnung von QUETZ gemäß § 5 TMG, Kontaktdaten und rechtliche Hinweise.",
  },
};

export default function ImpressumLayout(props: { children: React.ReactNode }) {
  return props.children;
}
