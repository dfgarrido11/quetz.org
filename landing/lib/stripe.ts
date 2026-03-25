import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

export const CURRENCY_CONFIG: Record<string, { currency: string; rate: number }> = {
  DE: { currency: 'eur', rate: 1.2 },
  AT: { currency: 'eur', rate: 1.2 },
  CH: { currency: 'chf', rate: 1.5 },
  ES: { currency: 'eur', rate: 0.8 },
  FR: { currency: 'eur', rate: 1.0 },
  US: { currency: 'usd', rate: 1.1 },
  GB: { currency: 'gbp', rate: 1.1 },
  MX: { currency: 'mxn', rate: 0.5 },
  AR: { currency: 'ars', rate: 0.4 },
  CO: { currency: 'cop', rate: 0.4 },
  BR: { currency: 'brl', rate: 0.5 },
  IN: { currency: 'inr', rate: 0.25 },
  GT: { currency: 'gtq', rate: 0.15 },
  DEFAULT: { currency: 'eur', rate: 1.0 },
};

// Currency conversion rates to EUR (approximate)
export const TO_EUR_RATES: Record<string, number> = {
  eur: 1,
  usd: 0.92,
  gbp: 1.17,
  chf: 1.05,
  mxn: 0.054,
  ars: 0.0011,
  cop: 0.00023,
  brl: 0.18,
  inr: 0.011,
  gtq: 0.12,
};

export function getCurrencyConfig(countryCode: string) {
  return CURRENCY_CONFIG[countryCode] || CURRENCY_CONFIG.DEFAULT;
}

export function calculatePrice(baseEur: number, countryCode: string): { amount: number; currency: string } {
  const config = getCurrencyConfig(countryCode);
  const adjustedEur = baseEur * config.rate;
  
  // Convert EUR to local currency
  const toLocalRate = 1 / (TO_EUR_RATES[config.currency] || 1);
  const localAmount = Math.round(adjustedEur * toLocalRate * 100) / 100;
  
  return {
    amount: localAmount,
    currency: config.currency,
  };
}
