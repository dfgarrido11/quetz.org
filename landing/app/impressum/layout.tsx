import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | QUETZ",
  alternates: { canonical: "/impressum" },
  openGraph: {
    url: "https://quetz.org/impressum",
    title: "Impressum | QUETZ",
  },
};

export default function ImpressumLayout(props: { children: React.ReactNode }) {
  return props.children;
}
