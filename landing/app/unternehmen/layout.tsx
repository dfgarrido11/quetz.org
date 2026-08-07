import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aufforstung für Unternehmen — Bäume für Ihr Team',
  description:
    'Nachhaltigkeitspartner für den deutschen Mittelstand: ein Baum pro Mitarbeiter ab 12 €/Monat, innerhalb des 50-€-Sachbezugs. Mit GPS-Nachweis, Impact-Dashboard und Dokumentation für Ihr Nachhaltigkeitsreporting.',
  alternates: { canonical: '/unternehmen' },
  openGraph: {
    title: 'Aufforstung für Unternehmen | QUETZ',
    description:
      'Ein Baum pro Mitarbeiter ab 12 €/Monat. GPS-Nachweis, Impact-Dashboard und Dokumentation für Ihr Nachhaltigkeitsreporting.',
    url: 'https://quetz.org/unternehmen',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'QUETZ für Unternehmen' }],
    type: 'website',
    locale: 'de_DE',
  },
};

export default function UnternehmenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
