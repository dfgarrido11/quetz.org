import type { Metadata } from 'next';

// Personal / transactional route — indexable content would be user-specific,
// so it is excluded from search while still carrying a proper title.
export const metadata: Metadata = {
  title: 'Zertifikat',
  description: 'Ihr QUETZ-Baumzertifikat.',
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
