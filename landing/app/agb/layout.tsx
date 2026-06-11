import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB",
  alternates: { canonical: "/agb" },
  openGraph: {
    url: "https://quetz.org/agb",
    title: "AGB | QUETZ",
  },
};

export default function AgbLayout(props: { children: React.ReactNode }) {
  return props.children;
}
