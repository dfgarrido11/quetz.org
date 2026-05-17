import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://quetz.org';

// Static routes with their priorities and change frequencies
const staticRoutes: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${SITE_URL}/transparencia`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/csr-partner`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${SITE_URL}/regalar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${SITE_URL}/carrito`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/agb`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  { url: `${SITE_URL}/datenschutz`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  { url: `${SITE_URL}/impressum`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
];

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

  return [...staticRoutes, ...baumRoutes];
}
