import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | QUETZ",
  alternates: { canonical: "/shop" },
  openGraph: {
    url: "https://quetz.org/shop",
    title: "Shop | QUETZ",
  },
};

export default function ShopLayout(props: { children: React.ReactNode }) {
  return props.children;
}
