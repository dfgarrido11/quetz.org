import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verschenken",
  alternates: { canonical: "/regalar" },
  openGraph: {
    url: "https://quetz.org/regalar",
    title: "Verschenken | QUETZ",
  },
};

export default function RegalarLayout(props: { children: React.ReactNode }) {
  return props.children;
}
