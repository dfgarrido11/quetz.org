'use client';

import { useEffect, useState } from 'react';

/**
 * Cookie consent state, shared by the banner and the tracking components.
 *
 * Previously the banner was purely decorative: <GoogleAnalytics /> and
 * <MetaPixel /> were mounted unconditionally in the root layout, so gtag
 * `config` and `fbq('init')`/`PageView` fired on page load — before the
 * visitor had answered. The banner then called gtag('consent','update')
 * afterwards, which is too late, and never touched the Meta Pixel at all.
 *
 * Now nothing loads until the matching category is granted, and revoking
 * consent takes effect on the next page load.
 */

export interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CONSENT_STORAGE_KEY = 'quetz_cookie_consent';

/** Fired on the window whenever consent is saved, so mounted components react without a reload. */
export const CONSENT_EVENT = 'quetz:consent-change';

/** Nothing optional is granted until the visitor opts in (DSGVO Art. 6(1)(a)). */
export const DENIED_CONSENT: ConsentSettings = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function readConsent(): ConsentSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentSettings>;
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    };
  } catch {
    return null;
  }
}

export function writeConsent(settings: ConsentSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable (private mode, quota). Still notify listeners
    // so the choice applies to this page view.
  }
  window.dispatchEvent(new CustomEvent<ConsentSettings>(CONSENT_EVENT, { detail: settings }));
}

/** Lets a visitor reopen the banner to change or withdraw consent (Art. 7(3)). */
export const CONSENT_REOPEN_EVENT = 'quetz:consent-reopen';

export function reopenConsentBanner(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT));
}

/**
 * Current consent. Starts fully denied on the server and on first client
 * render so tracking can never load before the stored value is read.
 */
export function useConsent(): ConsentSettings {
  const [consent, setConsent] = useState<ConsentSettings>(DENIED_CONSENT);

  useEffect(() => {
    setConsent(readConsent() ?? DENIED_CONSENT);

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ConsentSettings>).detail;
      setConsent(detail ?? readConsent() ?? DENIED_CONSENT);
    };

    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return consent;
}
