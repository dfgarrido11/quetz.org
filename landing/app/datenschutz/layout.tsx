import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von QUETZ nach DSGVO: Verantwortlicher, Rechtsgrundlagen, Auftragsverarbeiter, Drittlandübermittlung, Speicherdauer, Cookies sowie Ihre Rechte inklusive Widerspruchsrecht nach Art. 21 DSGVO.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: true, follow: true },
  openGraph: {
    url: "https://quetz.org/datenschutz",
    title: "Datenschutzerklärung | QUETZ",
    description:
      "Wie QUETZ personenbezogene Daten verarbeitet: Rechtsgrundlagen, Empfänger, Speicherdauer und Ihre Betroffenenrechte nach DSGVO.",
  },
};

export default function DatenschutzLayout(props: { children: React.ReactNode }) {
  return props.children;
}
