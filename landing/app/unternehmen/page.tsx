'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import EmpresasPage from '../csr-partner/page';

export default function UnternehmenPage() {
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    // Auto-switch to German when accessing /unternehmen
    if (language !== 'de') {
      setLanguage('de');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <EmpresasPage />;
}
