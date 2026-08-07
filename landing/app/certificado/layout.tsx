import type { Metadata } from 'next';

// Personal / transactional route — indexable content would be user-specific,
// so it is excluded from search while still carrying a proper title.
export const metadata: Metadata = {
  title: 'Certificado',
  description: 'Tu certificado de árbol QUETZ.',
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
