import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "../../components/json-ld";
import { BlogFooter, BlogHeader } from "../blog-chrome";
import {
  SITE_URL,
  formatGermanDate,
  getArticleBySlug,
  getArticleSlugs,
  getRelatedArticles,
} from "../articles";
import { getArticleBody } from "../_content";

interface BlogArticleParams {
  slug: string;
}

export function generateStaticParams(): BlogArticleParams[] {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: BlogArticleParams;
}): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Artikel nicht gefunden",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}/blog/${article.slug}`;

  return {
    title: article.metaTitle,
    description: article.description,
    keywords: [...article.keywords],
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      url,
      title: `${article.metaTitle} | QUETZ`,
      description: article.description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: "article",
      locale: "de_DE",
      siteName: "QUETZ",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.description,
      images: ["/og-image.png"],
    },
  };
}

export default function BlogArticlePage({
  params,
}: {
  params: BlogArticleParams;
}) {
  const article = getArticleBySlug(params.slug);
  const Body = getArticleBody(params.slug);

  if (!article || !Body) {
    notFound();
  }

  const url = `${SITE_URL}/blog/${article.slug}`;
  const related = getRelatedArticles(article.slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    inLanguage: "de-DE",
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    keywords: article.keywords.join(", "),
    articleSection: article.category,
    wordCount: article.readingTimeMinutes * 200,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: `${SITE_URL}/og-image.png`,
    author: {
      "@type": "Organization",
      name: article.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "QUETZ",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-quetz-oficial.png`,
      },
    },
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
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogHeader />

      <main className="bg-white">
        {/* Hero */}
        <header className="bg-[#081C15] px-4 pb-14 pt-32 text-white sm:px-6 sm:pb-16 sm:pt-40">
          <div className="mx-auto max-w-3xl">
            <nav aria-label="Brotkrumen" className="mb-6 text-sm text-white/60">
              <Link href="/" className="hover:text-white">
                Startseite
              </Link>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <Link href="/blog" className="hover:text-white">
                Blog
              </Link>
            </nav>

            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wide text-quetz-cream/70">
              <span className="rounded-full bg-white/10 px-3 py-1">
                {article.category}
              </span>
              <time dateTime={article.publishedAt}>
                {formatGermanDate(article.publishedAt)}
              </time>
              <span aria-hidden="true">·</span>
              <span>{article.readingTimeMinutes} Min. Lesezeit</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              {article.title}
            </h1>
          </div>
        </header>

        {/* Body */}
        <article className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <Body />

            <p className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500">
              Zuletzt aktualisiert am {formatGermanDate(article.updatedAt)}.
              Alle Angaben zu Bäumen, Familien und Einnahmen entsprechen dem
              öffentlich einsehbaren Stand auf unserer{" "}
              <Link
                href="/transparencia"
                className="font-semibold text-quetz-green underline underline-offset-4"
              >
                Transparenzseite
              </Link>
              .
            </p>

            {/* CTA */}
            <div className="mt-12 rounded-3xl bg-quetz-cream p-8">
              <h2 className="mb-3 text-2xl font-bold text-quetz-green">
                Einen Baum adoptieren
              </h2>
              <p className="mb-6 text-[17px] leading-8 text-gray-700">
                Jeder Baum wird in Zacapa, Guatemala von lokalen Familien
                gepflanzt, die für diese Arbeit bezahlt werden. Sie erhalten
                Foto, Baumart, Pflanzdatum und GPS-Koordinaten.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/#planes"
                  className="rounded-full bg-quetz-green px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700"
                >
                  Pakete ansehen
                </Link>
                <Link
                  href="/shop"
                  className="rounded-full border border-quetz-green px-6 py-3 text-sm font-bold text-quetz-green transition-colors hover:bg-white"
                >
                  Zum Shop
                </Link>
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <section className="mt-14">
                <h2 className="mb-6 text-xl font-bold text-gray-900">
                  Weiterlesen
                </h2>
                <ul className="space-y-4">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/blog/${item.slug}`}
                        className="block rounded-2xl border border-gray-200 p-5 transition-colors hover:border-quetz-green/40 hover:bg-quetz-cream/50"
                      >
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-quetz-green">
                          {item.category}
                        </span>
                        <span className="block font-bold text-gray-900">
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>
      </main>

      <BlogFooter />
    </>
  );
}
