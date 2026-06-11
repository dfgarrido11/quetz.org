import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparenz",
  description: "Vollständiger Geldfluss in Echtzeit. Jeder Cent dokumentiert. Stripe-Gebühren inklusive.",
  alternates: { canonical: "/transparencia" },
  openGraph: {
    url: "https://quetz.org/transparencia",
    title: "Transparenz | QUETZ",
    description: "Vollständiger Geldfluss in Echtzeit. Jeder Cent dokumentiert.",
  },
};

export default function TransparenciaLayout(props: { children: React.ReactNode }) {
  return props.children;
}
