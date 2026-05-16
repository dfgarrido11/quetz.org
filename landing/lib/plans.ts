/**
 * Single source of truth for Quetz.org subscription plans and tree species.
 * Import this in: chatbot, checkout validation, email templates.
 */

export type PlanId = "cafe" | "bosque_small" | "bosque_grande";
export type GiftType = "gift";

export interface SubscriptionPlan {
  id: PlanId;
  priceMonthly: number;
  treesPerMonth: number;
  /** null means all active species are allowed */
  allowedSpecies: string[] | null;
  nameDe: string;
  nameEn: string;
  nameEs: string;
}

export interface GiftPlan {
  id: GiftType;
  priceOnce: number;
  /** null means all active species are allowed */
  allowedSpecies: string[] | null;
  nameDe: string;
  nameEn: string;
  nameEs: string;
}

export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlan> = {
  cafe: {
    id: "cafe",
    priceMonthly: 5,
    treesPerMonth: 1,
    // Plan Café is priced at €5 — only low-cost species (pino, cipres)
    allowedSpecies: ["pino", "cipres"],
    nameDe: "Café-Plan",
    nameEn: "Café Plan",
    nameEs: "Plan Café",
  },
  bosque_small: {
    id: "bosque_small",
    priceMonthly: 12,
    treesPerMonth: 3,
    allowedSpecies: null, // all species
    nameDe: "Kleiner Wald",
    nameEn: "Small Forest",
    nameEs: "Bosque Pequeño",
  },
  bosque_grande: {
    id: "bosque_grande",
    priceMonthly: 35,
    treesPerMonth: 10,
    allowedSpecies: null, // all species
    nameDe: "Großer Wald",
    nameEn: "Large Forest",
    nameEs: "Bosque Grande",
  },
};

export const GIFT_PLAN: GiftPlan = {
  id: "gift",
  priceOnce: 25,
  allowedSpecies: null, // all species
  nameDe: "Baum-Geschenk",
  nameEn: "Tree Gift",
  nameEs: "Árbol Regalo",
};

// ========== B2B PLANS ==========

export type B2bPlanId = "b2bSprout" | "b2bStarter" | "b2bBusiness" | "b2bEnterprise";

export interface B2bPlan {
  id: B2bPlanId;
  priceEur: number | null;
  priceYearEur: number | null;
  treesPerMonth: number;
  allowedSpecies: string[];
  salesLed?: boolean;
  priceIdMonthly?: string;
  priceIdYearly?: string;
}

export const B2B_PLANS: Record<B2bPlanId, B2bPlan> = {
  b2bSprout: {
    id: "b2bSprout",
    priceEur: 49,
    priceYearEur: 499,
    treesPerMonth: 2,
    allowedSpecies: ["pino", "cipres"],
    priceIdMonthly: process.env.STRIPE_PRICE_B2B_SPROUT_MONTHLY,
    priceIdYearly: process.env.STRIPE_PRICE_B2B_SPROUT_YEARLY,
  },
  b2bStarter: {
    id: "b2bStarter",
    priceEur: 149,
    priceYearEur: 1519,
    treesPerMonth: 6,
    allowedSpecies: ["pino", "cipres"],
    priceIdMonthly: process.env.STRIPE_PRICE_B2B_STARTER_MONTHLY,
    priceIdYearly: process.env.STRIPE_PRICE_B2B_STARTER_YEARLY,
  },
  b2bBusiness: {
    id: "b2bBusiness",
    priceEur: 499,
    priceYearEur: 5089,
    treesPerMonth: 20,
    allowedSpecies: ["pino", "cipres"],
    priceIdMonthly: process.env.STRIPE_PRICE_B2B_BUSINESS_MONTHLY,
    priceIdYearly: process.env.STRIPE_PRICE_B2B_BUSINESS_YEARLY,
  },
  b2bEnterprise: {
    id: "b2bEnterprise",
    priceEur: null,
    priceYearEur: null,
    treesPerMonth: 50,
    allowedSpecies: ["pino", "cipres"],
    salesLed: true,
  },
};

// ========== FIRMENGESCHENK PLANS ==========

export type FirmengeschenkPlanId = "fg10" | "fg25" | "fg50" | "fg100";

export interface FirmengeschenkPlan {
  id: FirmengeschenkPlanId;
  treeCount: number;
  priceEur: number;
  nameDe: string;
  pricePerTreeEur: number;
}

// Stripe Product IDs (created 16 mayo 2026 via Stripe MCP)
// prod_UWqe0UfvqVkC7v → klein  | prod_UWqeweHL7NcJcM → medium
// prod_UWqeqr1e9gTRXs → gross  | prod_UWqfXuoV1wQWxe → xl
// Stripe metadata: type=firmengeschenk, package=klein|medium|gross|xl, tree_count=10|25|50|100
export const FIRMENGESCHENK_PLANS: Record<FirmengeschenkPlanId, FirmengeschenkPlan> = {
  fg10: {
    id: "fg10",
    treeCount: 10,
    priceEur: 99,
    pricePerTreeEur: 9.9,
    nameDe: "Firmengeschenk Klein (10 Bäume)",
  },
  fg25: {
    id: "fg25",
    treeCount: 25,
    priceEur: 229,
    pricePerTreeEur: 9.16,
    nameDe: "Firmengeschenk Medium (25 Bäume)",
  },
  fg50: {
    id: "fg50",
    treeCount: 50,
    priceEur: 449,
    pricePerTreeEur: 8.98,
    nameDe: "Firmengeschenk Groß (50 Bäume)",
  },
  fg100: {
    id: "fg100",
    treeCount: 100,
    priceEur: 849,
    pricePerTreeEur: 8.49,
    nameDe: "Firmengeschenk XL (100 Bäume)",
  },
};

/** All species currently active in production DB */
export const ACTIVE_SPECIES = [
  "pino",
  "cipres",
  "cafe",
  "aguacate",
  "caoba",
  "mango",
  "cedro",
  "cacao",
  "limon",
] as const;

export type Species = (typeof ACTIVE_SPECIES)[number];
