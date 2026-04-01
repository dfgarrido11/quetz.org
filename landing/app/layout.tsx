import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import GoogleAnalytics from './components/google-analytics';
import MetaPixel from './components/meta-pixel';
import CookieBanner from './components/cookie-banner';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://quetz.org';
  
  return {
    title: {
      default: 'QUETZ – Bäume adoptieren in Guatemala | Echte Wirkung, 100% transparent',
      template: '%s | QUETZ',
    },
    description: 'Adoptiere einen Baum in Guatemala, schaffe Arbeit für Familien und baue eine Schule für 120 Kinder. Alles verifizierbar. Ab 5€.',
    keywords: [
      'Bäume adoptieren', 'Baum adoptieren Deutschland', 'nachhaltige Geschenke',
      'Aufforstung Guatemala', 'CSR Unternehmen', 'Firmenwald', 'CO2 kompensieren',
      'soziale Projekte Guatemala', 'Schule bauen spenden', 'Impact Investing'
    ],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
      languages: {
        'de': baseUrl,
        'es': `${baseUrl}?lang=es`,
        'en': `${baseUrl}?lang=en`,
      },
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/logo-quetz-oficial.png',
    },
    openGraph: {
      title: 'QUETZ – Bäume adoptieren in Guatemala | Echte Wirkung',
      description: 'Adoptiere einen Baum, schaffe Arbeit für Familien und baue eine Schule für 120 Kinder. Ab 5€.',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'QUETZ - Bäume adoptieren in Guatemala' }],
      type: 'website',
      locale: 'de_DE',
      siteName: 'QUETZ',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'QUETZ – Bäume adoptieren mit echtem Impact',
      description: 'Adoptiere einen Baum in Guatemala. Schaffe Arbeit. Baue eine Schule. 100% transparent.',
      images: ['/og-image.png'],
      creator: '@quetz_org',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'YOUR_GOOGLE_VERIFICATION_CODE',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-quetz-cream">
        <Providers>{children}</Providers>
        <GoogleAnalytics />
        <MetaPixel />
        <CookieBanner />
      </body>
    </html>
  );
}
