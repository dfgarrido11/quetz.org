'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, languages, translations, getTranslation as getT } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Map browser language codes to our supported languages
const browserLangMap: Record<string, Language> = {
  'es': 'es', 'es-ES': 'es', 'es-MX': 'es', 'es-AR': 'es', 'es-CO': 'es', 'es-CL': 'es',
  'de': 'de', 'de-DE': 'de', 'de-AT': 'de', 'de-CH': 'de',
  'en': 'en', 'en-US': 'en', 'en-GB': 'en', 'en-AU': 'en', 'en-CA': 'en',
  'fr': 'fr', 'fr-FR': 'fr', 'fr-CA': 'fr', 'fr-BE': 'fr', 'fr-CH': 'fr',
  'ar': 'ar', 'ar-SA': 'ar', 'ar-AE': 'ar', 'ar-EG': 'ar', 'ar-MA': 'ar',
};

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to set cookie
function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

// Detect language from browser
function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'es';
  
  // Check navigator.languages first (ordered by preference)
  const browserLanguages = navigator.languages || [navigator.language];
  
  for (const lang of browserLanguages) {
    // Check exact match first
    if (browserLangMap[lang]) {
      return browserLangMap[lang];
    }
    // Check base language (e.g., 'es' from 'es-419')
    const baseLang = lang.split('-')[0];
    if (browserLangMap[baseLang]) {
      return browserLangMap[baseLang];
    }
  }
  
  return 'es'; // Default to Spanish
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language on mount
  useEffect(() => {
    // Priority: 1. Cookie, 2. Browser preference, 3. Default (es)
    const savedLang = getCookie('quetz_lang') as Language | null;
    
    if (savedLang && languages.some(l => l.code === savedLang)) {
      setLanguageState(savedLang);
    } else {
      const detectedLang = detectBrowserLanguage();
      setLanguageState(detectedLang);
      setCookie('quetz_lang', detectedLang);
    }
    
    setIsInitialized(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setCookie('quetz_lang', lang);
  }, []);

  const t = useCallback((key: string): string => {
    return getT(language, key);
  }, [language]);

  const isRTL = language === 'ar';

  // Update document direction for RTL languages
  useEffect(() => {
    if (typeof document !== 'undefined' && isInitialized) {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [isRTL, language, isInitialized]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
