import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { articles } from './blog/articles';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://quetz.org';

// Static routes with their priorities and change frequencies
const staticRoutes: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${SITE_URL}/firmengeschenk`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${SITE_URL}/gedenkbaum`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${SITE_URL}/transparencia`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/csr-partner`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${SITE_URL}/unternehmen`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${SITE_URL}/regalar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  // /carrito is deliberately absent: it is noindex (personal, transactional).
  { url: `${SITE_URL}/agb`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  { url: `${SITE_URL}/datenschutz`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  { url: `${SITE_URL}/impressum`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
];

// One entry per blog article, driven by the typed content module
const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
  url: `${SITE_URL}/blog/${article.slug}`,
  lastModified: new Date(article.updatedAt),
  changeFrequency: 'monthly' as const,
  priority: 0.7,
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Dynamic /baum/[adoptionId] routes for active adoption microsites
  let baumRoutes: MetadataRoute.Sitemap = [];
  try {
    const adoptions = await prisma.adoption.findMany({
      where: { status: { in: ['paid', 'active', 'completed'] } },
      select: { id: true, createdAt: true },
    });
    baumRoutes = adoptions.map((a) => ({
      url: `${SITE_URL}/baum/${a.id}`,
      lastModified: a.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // Non-fatal: sitemap works without dynamic routes if DB is unavailable
  }

  return [...staticRoutes, ...blogRoutes, ...baumRoutes];
}
