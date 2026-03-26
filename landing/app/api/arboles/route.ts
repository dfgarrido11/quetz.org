export const dynamic = "force-dynamic";




import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Price multipliers by country (based on purchasing power parity)
const COUNTRY_PRICE_FACTORS: Record<string, { factor: number; currency: string; symbol: string }> = {
  // High purchasing power
  DE: { factor: 1.2, currency: 'EUR', symbol: '€' },    // Germany
  CH: { factor: 1.5, currency: 'CHF', symbol: 'CHF' },  // Switzerland
  AT: { factor: 1.1, currency: 'EUR', symbol: '€' },    // Austria
  NL: { factor: 1.1, currency: 'EUR', symbol: '€' },    // Netherlands
  BE: { factor: 1.0, currency: 'EUR', symbol: '€' },    // Belgium
  FR: { factor: 1.0, currency: 'EUR', symbol: '€' },    // France
  US: { factor: 1.1, currency: 'USD', symbol: '$' },    // USA
  GB: { factor: 1.0, currency: 'GBP', symbol: '£' },    // UK
  CA: { factor: 1.0, currency: 'CAD', symbol: 'C$' },   // Canada
  AU: { factor: 1.0, currency: 'AUD', symbol: 'A$' },   // Australia
  
  // Medium purchasing power
  ES: { factor: 0.8, currency: 'EUR', symbol: '€' },    // Spain
  IT: { factor: 0.85, currency: 'EUR', symbol: '€' },   // Italy
  PT: { factor: 0.75, currency: 'EUR', symbol: '€' },   // Portugal
  MX: { factor: 0.5, currency: 'MXN', symbol: 'MX$' },  // Mexico
  AR: { factor: 0.4, currency: 'ARS', symbol: 'AR$' },  // Argentina
  CL: { factor: 0.6, currency: 'CLP', symbol: 'CLP' },  // Chile
  CO: { factor: 0.45, currency: 'COP', symbol: 'COP' }, // Colombia
  
  // Lower purchasing power
  BR: { factor: 0.5, currency: 'BRL', symbol: 'R$' },   // Brazil
  IN: { factor: 0.25, currency: 'INR', symbol: '₹' },   // India
  GT: { factor: 0.15, currency: 'GTQ', symbol: 'Q' },   // Guatemala
  HN: { factor: 0.2, currency: 'HNL', symbol: 'L' },    // Honduras
  SV: { factor: 0.25, currency: 'USD', symbol: '$' },   // El Salvador
  NI: { factor: 0.2, currency: 'NIO', symbol: 'C$' },   // Nicaragua
  
  // Middle East
  SA: { factor: 0.9, currency: 'SAR', symbol: 'ر.س' },  // Saudi Arabia
  AE: { factor: 1.0, currency: 'AED', symbol: 'د.إ' },  // UAE
  EG: { factor: 0.3, currency: 'EGP', symbol: 'E£' },   // Egypt
  MA: { factor: 0.4, currency: 'MAD', symbol: 'DH' },   // Morocco
};

// Default factor for unknown countries
const DEFAULT_PRICE_FACTOR = { factor: 1.0, currency: 'EUR', symbol: '€' };

// Currency conversion rates (approximate, from EUR)
const CURRENCY_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.95,
  CAD: 1.47,
  AUD: 1.65,
  MXN: 18.5,
  BRL: 5.4,
  INR: 90,
  GTQ: 8.5,
  ARS: 890,
  CLP: 980,
  COP: 4200,
  HNL: 26.5,
  NIO: 39,
  SAR: 4.05,
  AED: 3.97,
  EGP: 33,
  MAD: 11,
};

function getPriceForCountry(baseEur: number, countryCode: string): { 
  price: number; 
  currency: string; 
  symbol: string;
  priceEur: number;
} {
  const countryConfig = COUNTRY_PRICE_FACTORS[countryCode.toUpperCase()] || DEFAULT_PRICE_FACTOR;
  const adjustedEur = baseEur * countryConfig.factor;
  const conversionRate = CURRENCY_RATES[countryConfig.currency] || 1;
  const localPrice = Math.round(adjustedEur * conversionRate * 100) / 100;
  
  return {
    price: localPrice,
    currency: countryConfig.currency,
    symbol: countryConfig.symbol,
    priceEur: adjustedEur,
  };
}

function getLocalizedField(tree: Record<string, string | number | boolean | null>, field: string, lang: string): string {
  const langSuffix = lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
  const localizedKey = `${field}${langSuffix}`;
  return (tree[localizedKey] as string) || (tree[`${field}Es`] as string) || '';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'es';
    const country = searchParams.get('country') || 'ES';
    
    // Fetch all active trees
    const trees = await prisma.tree.findMany({
      where: { active: true },
      orderBy: { species: 'asc' },
    });
    
    // Tree type from Prisma
    type TreeRecord = typeof trees[number];
    
    // Transform trees with localized content and dynamic pricing
    const localizedTrees = trees.map((tree: TreeRecord) => {
      const pricing = getPriceForCountry(tree.priceBaseEur, country);
      
      // Cast tree to Record for getLocalizedField
      const treeRecord = tree as unknown as Record<string, string | number | boolean | null>;
      
      return {
        id: tree.id,
        species: tree.species,
        name: getLocalizedField(treeRecord, 'name', lang),
        description: getLocalizedField(treeRecord, 'desc', lang),
        impact: getLocalizedField(treeRecord, 'impact', lang),
        image: tree.image,
        iconUrl: tree.iconUrl,
        
        // Impact metrics
        impactCo2Kg: tree.impactCo2Kg,
        impactFamilies: tree.impactFamilies,
        
        // Pricing
        pricing: {
          baseEur: tree.priceBaseEur,
          local: pricing.price,
          currency: pricing.currency,
          symbol: pricing.symbol,
          displayPrice: `${pricing.symbol}${pricing.price}`,
          displayPriceEur: `€${tree.priceBaseEur}`,
        },
        
        // Package prices (1, 3, 10 trees with discounts)
        packages: [
          {
            quantity: 1,
            discount: 0,
            priceEur: tree.priceBaseEur,
            priceLocal: pricing.price,
            currency: pricing.currency,
            symbol: pricing.symbol,
          },
          {
            quantity: 3,
            discount: 10,
            priceEur: Math.round(tree.priceBaseEur * 3 * 0.9 * 100) / 100,
            priceLocal: Math.round(pricing.price * 3 * 0.9 * 100) / 100,
            currency: pricing.currency,
            symbol: pricing.symbol,
          },
          {
            quantity: 10,
            discount: 20,
            priceEur: Math.round(tree.priceBaseEur * 10 * 0.8 * 100) / 100,
            priceLocal: Math.round(pricing.price * 10 * 0.8 * 100) / 100,
            currency: pricing.currency,
            symbol: pricing.symbol,
          },
        ],
      };
    });
    
    return NextResponse.json({
      success: true,
      language: lang,
      country: country,
      trees: localizedTrees,
      meta: {
        total: localizedTrees.length,
        supportedLanguages: ['es', 'de', 'en', 'fr', 'ar'],
      },
    });
  } catch (error) {
    console.error('Error fetching trees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trees' },
      { status: 500 }
    );
  }
}
