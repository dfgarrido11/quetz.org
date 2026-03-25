'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  // Don't render in development or if no measurement ID
  if (process.env.NODE_ENV !== 'production' || !GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
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
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
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
