'use client';

import Script from 'next/script';
import { useConsent } from '@/lib/consent';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Loads Google Analytics only after the visitor grants analytics consent.
 * Consent Mode v2 defaults are declared denied before `config` runs, so even
 * the granted path never writes storage the visitor did not agree to.
 */
export default function GoogleAnalytics() {
  const consent = useConsent();

  if (process.env.NODE_ENV !== 'production' || !GA_MEASUREMENT_ID) {
    return null;
  }
  if (!consent.analytics) {
    return null;
  }

  return (
    <>
      <Script
        id="google-analytics-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
          `,
        }}
      />
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'update', { analytics_storage: 'granted' });
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
            });
          `,
        }}
      />
    </>
  );
}

// Custom event tracking helper
export function trackEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, parameters);
  }
}

// Track page views (useful for client-side navigation)
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

// Specific event trackers for QUETZ
export const analytics = {
  // Tree adoption events
  trackAdoption: (treeType: string, quantity: number, amount: number, currency: string) => {
    trackEvent('tree_adoption', {
      tree_type: treeType,
      quantity,
      amount,
      currency,
      event_category: 'adoption',
    });
  },

  // Donation events
  trackDonation: (amount: number, currency: string, purpose: string) => {
    trackEvent('donation', {
      amount,
      currency,
      purpose,
      event_category: 'donation',
    });
  },

  // Quetzito chatbot interactions
  trackChatbotOpen: () => {
    trackEvent('chatbot_open', {
      event_category: 'engagement',
    });
  },

  // Language change
  trackLanguageChange: (language: string) => {
    trackEvent('language_change', {
      language,
      event_category: 'user_preference',
    });
  },

  // User registration
  trackSignup: (method: string) => {
    trackEvent('sign_up', {
      method,
      event_category: 'authentication',
    });
  },

  // User login
  trackLogin: (method: string) => {
    trackEvent('login', {
      method,
      event_category: 'authentication',
    });
  },
};
