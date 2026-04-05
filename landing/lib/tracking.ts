// Enhanced tracking utilities for quetz.org retargeting

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    lintrk: (...args: any[]) => void;
  }
}

export type TrackingEvent =
  | 'page_view'
  | 'plan_viewed'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'lead_generated'
  | 'email_signup'
  | 'deck_download'
  | 'contact_form';

export interface TrackingData {
  event: TrackingEvent;
  value?: number;
  currency?: string;
  plan_type?: 'cafe' | 'bosque_pequeno' | 'bosque_grande';
  user_type?: 'individual' | 'business';
  content_category?: string;
  custom_parameters?: Record<string, string | number>;
}

/**
 * Unified tracking function that sends to all platforms
 */
export function trackEvent({
  event,
  value,
  currency = 'EUR',
  plan_type,
  user_type,
  content_category = 'sustainability',
  custom_parameters = {}
}: TrackingData): void {

  if (typeof window === 'undefined') return;

  // Google Analytics 4 Enhanced Ecommerce
  if (window.gtag) {
    const gaParams: Record<string, any> = {
      event_category: content_category,
      value: value,
      currency: currency,
      custom_user_type: user_type,
      custom_plan_type: plan_type,
      ...custom_parameters
    };

    switch (event) {
      case 'plan_viewed':
        window.gtag('event', 'view_item', {
          ...gaParams,
          item_category: 'subscription_plan',
          item_name: plan_type
        });
        break;

      case 'add_to_cart':
        window.gtag('event', 'add_to_cart', {
          ...gaParams,
          item_category: 'subscription_plan',
          item_name: plan_type,
          quantity: 1
        });
        break;

      case 'begin_checkout':
        window.gtag('event', 'begin_checkout', {
          ...gaParams,
          checkout_step: 1
        });
        break;

      case 'purchase':
        window.gtag('event', 'purchase', {
          ...gaParams,
          transaction_id: `quetz_${Date.now()}`,
          item_category: 'subscription_plan'
        });
        break;

      case 'lead_generated':
        window.gtag('event', 'generate_lead', {
          ...gaParams,
          lead_type: user_type
        });
        break;

      case 'email_signup':
        window.gtag('event', 'sign_up', {
          ...gaParams,
          method: 'email'
        });
        break;

      case 'deck_download':
        window.gtag('event', 'file_download', {
          ...gaParams,
          file_name: 'investor_deck',
          file_extension: 'pdf'
        });
        break;

      default:
        window.gtag('event', event, gaParams);
        break;
    }
  }

  // Meta Pixel (Facebook/Instagram Ads)
  if (window.fbq) {
    const metaParams = {
      content_category,
      content_name: plan_type || 'tree_adoption',
      value: value,
      currency: currency,
      user_type,
      custom_data: custom_parameters
    };

    switch (event) {
      case 'plan_viewed':
        window.fbq('track', 'ViewContent', metaParams);
        break;

      case 'add_to_cart':
        window.fbq('track', 'AddToCart', metaParams);
        break;

      case 'begin_checkout':
        window.fbq('track', 'InitiateCheckout', metaParams);
        break;

      case 'purchase':
        window.fbq('track', 'Purchase', metaParams);
        break;

      case 'lead_generated':
        window.fbq('track', 'Lead', metaParams);
        break;

      case 'email_signup':
        window.fbq('track', 'CompleteRegistration', metaParams);
        break;

      case 'deck_download':
        window.fbq('trackCustom', 'DownloadDeck', metaParams);
        break;

      default:
        window.fbq('trackCustom', event, metaParams);
        break;
    }
  }

  // LinkedIn Insight Tag (B2B tracking)
  if (window.lintrk) {
    const linkedinParams = {
      conversion_id: getLinkedInConversionId(event),
      value: value,
      currency: currency,
      user_type,
      plan_type
    };

    switch (event) {
      case 'deck_download':
        window.lintrk('track', { conversion_id: 'deck_download' });
        break;

      case 'lead_generated':
        window.lintrk('track', { conversion_id: 'lead_generation' });
        break;

      case 'contact_form':
        window.lintrk('track', { conversion_id: 'contact_us' });
        break;

      case 'purchase':
        window.lintrk('track', { conversion_id: 'purchase' });
        break;

      default:
        window.lintrk('track', { conversion_id: 'engagement' });
        break;
    }
  }

  // Console log for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 Tracking Event:', { event, value, currency, plan_type, user_type, custom_parameters });
  }
}

/**
 * Track specific plan interactions
 */
export function trackPlanView(planType: 'cafe' | 'bosque_pequeno' | 'bosque_grande', userType: 'individual' | 'business' = 'individual'): void {
  const planValues = {
    cafe: 5,
    bosque_pequeno: 12,
    bosque_grande: 35
  };

  trackEvent({
    event: 'plan_viewed',
    value: planValues[planType],
    plan_type: planType,
    user_type: userType,
    content_category: 'subscription_plan'
  });
}

/**
 * Track cart additions with plan details
 */
export function trackAddToCart(planType: 'cafe' | 'bosque_pequeno' | 'bosque_grande', quantity: number = 1): void {
  const planValues = {
    cafe: 5,
    bosque_pequeno: 12,
    bosque_grande: 35
  };

  trackEvent({
    event: 'add_to_cart',
    value: planValues[planType] * quantity,
    plan_type: planType,
    custom_parameters: {
      quantity,
      monthly_value: planValues[planType]
    }
  });
}

/**
 * Track B2B lead generation
 */
export function trackBusinessLead(companySize?: string, industry?: string): void {
  trackEvent({
    event: 'lead_generated',
    user_type: 'business',
    content_category: 'b2b_lead',
    custom_parameters: {
      company_size: companySize || 'unknown',
      industry: industry || 'unknown'
    }
  });
}

/**
 * Track deck downloads with UTM parameters
 */
export function trackDeckDownload(source?: string, campaign?: string): void {
  trackEvent({
    event: 'deck_download',
    content_category: 'investor_materials',
    custom_parameters: {
      utm_source: source || 'direct',
      utm_campaign: campaign || 'unknown',
      download_timestamp: Date.now()
    }
  });
}

/**
 * Create audiences for retargeting
 */
export function createRetargetingAudiences(): void {
  if (typeof window === 'undefined') return;

  // Create custom audiences based on user behavior
  const userBehavior = {
    time_on_site: Date.now(),
    pages_viewed: 1,
    plan_interest: null,
    user_type_detected: 'unknown'
  };

  // Store in localStorage for audience building
  localStorage.setItem('quetz_user_behavior', JSON.stringify(userBehavior));

  // Send to platforms for audience building
  if (window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      custom_map: {
        time_on_site: 'dimension1',
        plan_interest: 'dimension2',
        user_type: 'dimension3'
      }
    });
  }
}

/**
 * Helper function to get LinkedIn conversion IDs
 */
function getLinkedInConversionId(event: TrackingEvent): string {
  const conversionMap = {
    'purchase': process.env.NEXT_PUBLIC_LINKEDIN_PURCHASE_ID || 'purchase',
    'lead_generated': process.env.NEXT_PUBLIC_LINKEDIN_LEAD_ID || 'lead_gen',
    'deck_download': process.env.NEXT_PUBLIC_LINKEDIN_DECK_ID || 'deck_download',
    'contact_form': process.env.NEXT_PUBLIC_LINKEDIN_CONTACT_ID || 'contact',
    'email_signup': process.env.NEXT_PUBLIC_LINKEDIN_SIGNUP_ID || 'signup'
  };

  return (conversionMap as any)[event] || 'engagement';
}

/**
 * Enhanced ecommerce purchase tracking
 */
export function trackPurchase(
  transactionId: string,
  planType: string,
  value: number,
  quantity: number = 1
): void {
  trackEvent({
    event: 'purchase',
    value,
    plan_type: planType as any,
    custom_parameters: {
      transaction_id: transactionId,
      quantity,
      timestamp: Date.now(),
      payment_method: 'stripe'
    }
  });
}