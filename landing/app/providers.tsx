'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/lib/language-context';
import { QuetzitoProvider } from '@/components/quetzito/QuetzitoEngine';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <QuetzitoProvider>
          {children}
        </QuetzitoProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
