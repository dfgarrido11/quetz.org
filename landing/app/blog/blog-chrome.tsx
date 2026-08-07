"use client";

import { useRouter } from "next/navigation";
import Header from "../components/header";
import Footer from "../components/footer";

/**
 * Thin client wrappers so the (client-only) shared Header/Footer can be used
 * from the server-rendered blog pages. The header CTA sends visitors to the
 * plans section on the home page.
 */

export function BlogHeader() {
  const router = useRouter();
  return <Header onOpenModal={() => router.push("/#planes")} />;
}

export function BlogFooter() {
  return <Footer />;
}
