import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Für Unternehmen | QUETZ",
  alternates: { canonical: "/empresas" },
  openGraph: {
    url: "https://quetz.org/empresas",
    title: "Für Unternehmen | QUETZ",
  },
};

export default function EmpresasLayout(props: { children: React.ReactNode }) {
  return props.children;
}
