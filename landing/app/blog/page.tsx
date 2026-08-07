import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "../components/json-ld";
import { BlogFooter, BlogHeader } from "./blog-chrome";
import {
  SITE_URL,
  articles,
  formatGermanDate,
  getArticlesByDate,
} from "./articles";

export const metadata: Metadata = {
  title: "Blog | Bäume adoptieren, verschenken und pflanzen",
  description:
    "Ratgeber rund um Baumpatenschaften: Baum adoptieren in Deutschland, Baum verschenken, Gedenkbaum pflanzen und CSR-Baumpflanzung für Unternehmen. Ohne Greenwashing, mit nachprüfbaren Angaben.",
  keywords: [
    "Baum adoptieren Deutschland",
    "Baum verschenken",
    "Gedenkbaum pflanzen",
    "CSR Baumpflanzung Unternehmen",
    "Baumpatenschaft",
    "Aufforstung Guatemala",
    "nachhaltige Geschenke",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    url: `${SITE_URL}/blog`,
    title: "QUETZ Blog | Bäume adoptieren, verschenken und pflanzen",
    description:
      "Ratgeber zu Baumpatenschaften, Baumgeschenken, Gedenkbäumen und CSR-Baumpflanzungen. Nachprüfbar statt geschönt.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QUETZ Blog - Bäume adoptieren in Guatemala",
      },
    ],
    type: "website",
    locale: "de_DE",
    siteName: "QUETZ",
  },
};

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "QUETZ Blog",
  url: `${SITE_URL}/blog`,
  inLanguage: "de-DE",
  description:
    "Ratgeber rund um Baumpatenschaften, Baumgeschenke, Gedenkbäume und CSR-Baumpflanzung.",
  publisher: {
    "@type": "Organization",
    name: "QUETZ",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-quetz-oficial.png`,
  },
  blogPost: articles.map((article) => ({
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}/blog/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: article.author },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${SITE_URL}/blog`,
    },
  ],
};

export default function BlogIndexPage() {
  const posts = getArticlesByDate();

  return (
    <>
      <JsonLd data={blogJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogHeader />

      <main className="bg-white">
        {/* Hero */}
        <section className="bg-[#081C15] px-4 pb-16 pt-32 text-white sm:px-6 sm:pb-20 sm:pt-40">
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-quetz-cream/70">
              QUETZ Blog
            </p>
            <h1 className="mb-6 text-3xl font-bold leading-tight sm:text-5xl">
              Bäume adoptieren, verschenken und pflanzen
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/80">
              Ratgeber für alle, die wissen wollen, was hinter einer
              Baumpatenschaft wirklich steckt. Wir schreiben über den Ablauf,
              die Anlässe und über die Frage, welche Versprechen man
              nachprüfen kann und welche nicht.
            </p>
          </div>
        </section>

        {/* Article list */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <ul className="space-y-8">
              {posts.map((article) => (
                <li key={article.slug}>
                  <article className="group rounded-3xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg sm:p-8">
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <span className="rounded-full bg-quetz-cream px-3 py-1 text-quetz-green">
                        {article.category}
                      </span>
                      <time dateTime={article.publishedAt}>
                        {formatGermanDate(article.publishedAt)}
                      </time>
                      <span aria-hidden="true">·</span>
                      <span>{article.readingTimeMinutes} Min. Lesezeit</span>
                    </div>

                    <h2 className="mb-3 text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="transition-colors hover:text-quetz-green"
                      >
                        {article.title}
                      </Link>
                    </h2>

                    <p className="mb-5 text-[17px] leading-8 text-gray-600">
                      {article.excerpt}
                    </p>

                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-quetz-green underline decoration-quetz-green/40 underline-offset-4 hover:decoration-quetz-green"
                    >
                      Artikel lesen
                      <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-14 rounded-3xl bg-quetz-cream p-8 text-center">
              <h2 className="mb-3 text-2xl font-bold text-quetz-green">
                Lieber gleich einen Baum adoptieren?
              </h2>
              <p className="mx-auto mb-6 max-w-xl text-[17px] leading-8 text-gray-700">
                Jeder Baum wird in Zacapa, Guatemala von lokalen Familien
                gepflanzt und mit Foto, Baumart, Pflanzdatum und
                GPS-Koordinaten dokumentiert.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/#planes"
                  className="rounded-full bg-quetz-green px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700"
                >
                  Bäume adoptieren
                </Link>
                <Link
                  href="/transparencia"
                  className="rounded-full border border-quetz-green px-6 py-3 text-sm font-bold text-quetz-green transition-colors hover:bg-white"
                >
                  Zahlen ansehen
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BlogFooter />
    </>
  );
}
