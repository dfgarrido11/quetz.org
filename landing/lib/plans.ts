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
