'use client';

import Script from 'next/script';
import { useEffect } from 'react';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export default function MetaPixel() {
  // Don't render in development or if no pixel ID
  if (process.env.NODE_ENV !== 'production' || !META_PIXEL_ID) {
    return null;
  }

  useEffect(() => {
    // Initialize Meta Pixel when component mounts
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, []);

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Meta Pixel event tracking helpers
export function trackMetaEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, parameters);
  }
}

// Specific event trackers for QUETZ
export const metaPixel = {
  // AddToCart event - fires when user adds tree or plan to cart
  trackAddToCart: (params: {
    content_name: string;
    content_type: 'product' | 'subscription';
    content_ids: string[];
    value: number;
    currency: string;
  }) => {
    trackMetaEvent('AddToCart', {
      content_name: params.content_name,
      content_type: params.content_type,
      content_ids: params.content_ids,
      value: params.value,
      currency: params.currency,
    });
  },

  // InitiateCheckout event - fires when user clicks "Proceder al pago"
  trackInitiateCheckout: (params: {
    content_category: 'tree_adoption' | 'subscription' | 'donation';
    num_items: number;
    value: number;
    currency: string;
  }) => {
    trackMetaEvent('InitiateCheckout', {
      content_category: params.content_category,
      num_items: params.num_items,
      value: params.value,
      currency: params.currency,
    });
  },

  // Purchase event - fires after successful payment
  trackPurchase: (params: {
    content_type: 'product' | 'subscription';
    content_ids: string[];
    num_items: number;
    value: number;
    currency: string;
  }) => {
    trackMetaEvent('Purchase', {
      content_type: params.content_type,
      content_ids: params.content_ids,
      num_items: params.num_items,
      value: params.value,
      currency: params.currency,
    });
  },

  // ViewContent event - fires when user views tree details
  trackViewContent: (params: {
    content_name: string;
    content_type: 'product' | 'subscription';
    content_ids: string[];
    value?: number;
    currency?: string;
  }) => {
    trackMetaEvent('ViewContent', {
      content_name: params.content_name,
      content_type: params.content_type,
      content_ids: params.content_ids,
      value: params.value,
      currency: params.currency,
    });
  },

  // Lead event - fires when user submits corporate form
  trackLead: (params: {
    content_name: string;
    value?: number;
    currency?: string;
  }) => {
    trackMetaEvent('Lead', {
      content_name: params.content_name,
      value: params.value,
      currency: params.currency,
    });
  },

  // CompleteRegistration event - fires when user signs up
  trackCompleteRegistration: (params: {
    content_name: string;
    status: string;
  }) => {
    trackMetaEvent('CompleteRegistration', {
      content_name: params.content_name,
      status: params.status,
    });
  },
};
