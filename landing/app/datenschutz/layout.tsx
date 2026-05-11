import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz | QUETZ",
  alternates: { canonical: "/datenschutz" },
  openGraph: {
    url: "https://quetz.org/datenschutz",
    title: "Datenschutz | QUETZ",
  },
};

export default function DatenschutzLayout(props: { children: React.ReactNode }) {
  return props.children;
}
