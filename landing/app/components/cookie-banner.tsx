'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Settings, Check } from 'lucide-react';
import Link from 'next/link';
import {
  CONSENT_REOPEN_EVENT,
  DENIED_CONSENT,
  readConsent,
  writeConsent,
  type ConsentSettings,
} from '@/lib/consent';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<ConsentSettings>(DENIED_CONSENT);

  useEffect(() => {
    const saved = readConsent();
    if (saved) {
      setConsent(saved);
    } else {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Visitors must be able to withdraw consent as easily as they gave it
  // (Art. 7(3) DSGVO) — the footer link dispatches this.
  useEffect(() => {
    const reopen = () => {
      setConsent(readConsent() ?? DENIED_CONSENT);
      setShowSettings(true);
      setShowBanner(true);
    };
    window.addEventListener(CONSENT_REOPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, reopen);
  }, []);

  const saveConsent = (settings: ConsentSettings) => {
    setConsent(settings);
    setShowBanner(false);
    setShowSettings(false);
    // Persists and notifies <GoogleAnalytics /> / <MetaPixel />, which mount
    // only once the matching category is granted.
    writeConsent(settings);
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  };

  const acceptNecessary = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  };

  const saveCustom = () => {
    saveConsent(consent);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[200] p-4"
      >
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {!showSettings ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-quetz-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-quetz-green" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Wir respektieren Ihre Privatsphäre
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und unsere Website zu analysieren. 
                    Sie können wählen, welche Cookies Sie akzeptieren möchten.{' '}
                    <Link href="/datenschutz" className="text-quetz-green hover:underline">
                      Mehr erfahren
                    </Link>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={acceptAll}
                      className="bg-quetz-green text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Alle akzeptieren
                    </button>
                    <button
                      onClick={acceptNecessary}
                      className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Nur notwendige
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="text-gray-600 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Einstellungen
                    </button>
                  </div>
                </div>
                <button
                  onClick={acceptNecessary}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Cookie-Einstellungen</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notwendige Cookies</p>
                    <p className="text-sm text-gray-500">Für Login, Warenkorb und grundlegende Funktionen</p>
                  </div>
                  <div className="w-12 h-6 bg-quetz-green rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Analyse-Cookies</p>
                    <p className="text-sm text-gray-500">Google Analytics zur Verbesserung unserer Website</p>
                  </div>
                  <button
                    onClick={() => setConsent(c => ({ ...c, analytics: !c.analytics }))}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      consent.analytics ? 'bg-quetz-green justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Marketing-Cookies</p>
                    <p className="text-sm text-gray-500">Meta-Pixel für Werbung auf Facebook und Instagram</p>
                  </div>
                  <button
                    onClick={() => setConsent(c => ({ ...c, marketing: !c.marketing }))}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      consent.marketing ? 'bg-quetz-green justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={saveCustom}
                  className="flex-1 bg-quetz-green text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Auswahl speichern
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Alle akzeptieren
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
