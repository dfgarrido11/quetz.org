/**
 * Typed content index for the QUETZ blog.
 *
 * Metadata only. The article bodies live in `app/blog/_content/<slug>.tsx`
 * and are wired up in `app/blog/_content/index.ts`.
 */

export interface Article {
  /** URL segment under /blog */
  readonly slug: string;
  /** H1 shown on the article page */
  readonly title: string;
  /** <title> used for SEO (kept shorter than the H1 where useful) */
  readonly metaTitle: string;
  /** meta description + openGraph description */
  readonly description: string;
  /** Teaser shown on the blog index */
  readonly excerpt: string;
  /** ISO date (YYYY-MM-DD) */
  readonly publishedAt: string;
  /** ISO date (YYYY-MM-DD) */
  readonly updatedAt: string;
  /** Estimated reading time in minutes */
  readonly readingTimeMinutes: number;
  /** Main SEO keyword this article targets */
  readonly focusKeyword: string;
  /** Secondary keywords for the metadata block */
  readonly keywords: readonly string[];
  /** Short label shown as a badge on the index */
  readonly category: string;
  readonly author: string;
}

export const SITE_URL = "https://quetz.org";

export const articles: readonly Article[] = [
  {
    slug: "baum-adoptieren-deutschland",
    title:
      "Baum adoptieren in Deutschland: So funktioniert eine Patenschaft, die Sie nachprüfen können",
    metaTitle: "Baum adoptieren Deutschland: Ratgeber & Ablauf",
    description:
      "Baum adoptieren von Deutschland aus: Was eine Baumpatenschaft wirklich bedeutet, wie der Ablauf aussieht, woran Sie seriöse Anbieter erkennen und welche Versprechen Sie kritisch prüfen sollten.",
    excerpt:
      "Baumpatenschaften gibt es viele, nachprüfbare deutlich weniger. Dieser Ratgeber erklärt, was beim Adoptieren eines Baumes tatsächlich passiert, welche Belege Sie verlangen sollten und warum GPS-Koordinaten und Fotos mehr wert sind als große Zahlen.",
    publishedAt: "2026-05-12",
    updatedAt: "2026-07-28",
    readingTimeMinutes: 7,
    focusKeyword: "Baum adoptieren Deutschland",
    keywords: [
      "Baum adoptieren Deutschland",
      "Baumpatenschaft",
      "Baum adoptieren",
      "Baumpatenschaft verschenken",
      "Aufforstung Guatemala",
      "nachhaltige Geschenke",
    ],
    category: "Ratgeber",
    author: "QUETZ",
  },
  {
    slug: "baum-verschenken",
    title:
      "Baum verschenken: Das Geschenk, das nach dem Auspacken weiterwächst",
    metaTitle: "Baum verschenken: Ideen, Anlässe und Ablauf",
    description:
      "Einen Baum verschenken statt Krimskrams: Für welche Anlässe sich ein Baumgeschenk eignet, wie die Übergabe funktioniert, was auf der Urkunde steht und worauf Sie beim Anbieter achten sollten.",
    excerpt:
      "Ein Baum ist ein Geschenk ohne Verpackungsmüll, ohne Größentabelle und ohne Verfallsdatum. Wir zeigen die passenden Anlässe, wie die Übergabe abläuft und wie Sie ein Baumgeschenk persönlich statt beliebig machen.",
    publishedAt: "2026-06-03",
    updatedAt: "2026-07-28",
    readingTimeMinutes: 7,
    focusKeyword: "Baum verschenken",
    keywords: [
      "Baum verschenken",
      "Baum schenken",
      "nachhaltiges Geschenk",
      "Geschenk Baumpatenschaft",
      "Geschenkidee nachhaltig",
      "Baum pflanzen Geschenk",
    ],
    category: "Geschenkideen",
    author: "QUETZ",
  },
  {
    slug: "gedenkbaum-pflanzen",
    title:
      "Gedenkbaum pflanzen: Ein lebendiges Andenken statt Schnittblumen",
    metaTitle: "Gedenkbaum pflanzen: Ablauf, Kosten, Alternativen",
    description:
      "Einen Gedenkbaum pflanzen lassen: Was ein Erinnerungsbaum leistet, wie er sich von Grabstätte und Trauerkranz unterscheidet, wie der Ablauf aussieht und wie Sie ihn im Kondolenzschreiben ankündigen.",
    excerpt:
      "Ein Gedenkbaum ist kein Ersatz für ein Grab, aber ein Ort, der weiterwächst. Dieser Text erklärt den Ablauf, die Unterschiede zu Trauerkranz und Grabstätte und wie Sie einen Erinnerungsbaum taktvoll ankündigen.",
    publishedAt: "2026-06-24",
    updatedAt: "2026-07-28",
    readingTimeMinutes: 7,
    focusKeyword: "Gedenkbaum pflanzen",
    keywords: [
      "Gedenkbaum pflanzen",
      "Gedenkbaum",
      "Erinnerungsbaum",
      "Trauerbaum",
      "Spende statt Kranz",
      "lebendiges Andenken",
    ],
    category: "Gedenken",
    author: "QUETZ",
  },
  {
    slug: "csr-baumpflanzung-unternehmen",
    title:
      "CSR-Baumpflanzung für Unternehmen: Was glaubwürdig ist und was Sie besser nicht behaupten",
    metaTitle: "CSR Baumpflanzung Unternehmen: Leitfaden ohne Greenwashing",
    description:
      "CSR-Baumpflanzung für Unternehmen: Welche Aussagen nach der EmpCo-Richtlinie noch tragfähig sind, warum Bäume keine Kompensation sind und wie Sie ein Baumprojekt intern wie extern sauber kommunizieren.",
    excerpt:
      "Baumpflanzungen sind ein beliebtes CSR-Instrument und ein häufiger Anlass für Abmahnungen. Der Leitfaden trennt belegbare Aussagen von riskanten Claims und zeigt, wie Sie ein Baumprojekt rechtssicher kommunizieren.",
    publishedAt: "2026-07-15",
    updatedAt: "2026-07-28",
    readingTimeMinutes: 8,
    focusKeyword: "CSR Baumpflanzung Unternehmen",
    keywords: [
      "CSR Baumpflanzung Unternehmen",
      "CSR Bäume pflanzen",
      "Nachhaltigkeit Unternehmen",
      "Greenwashing vermeiden",
      "Firmenwald",
      "CSR Kommunikation",
    ],
    category: "Unternehmen",
    author: "QUETZ",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticleSlugs(): string[] {
  return articles.map((article) => article.slug);
}

/** Newest first, for the blog index. */
export function getArticlesByDate(): Article[] {
  return [...articles].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

/** Up to `limit` other articles, used for the "Weiterlesen" block. */
export function getRelatedArticles(slug: string, limit = 3): Article[] {
  return getArticlesByDate()
    .filter((article) => article.slug !== slug)
    .slice(0, limit);
}

export function formatGermanDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}
