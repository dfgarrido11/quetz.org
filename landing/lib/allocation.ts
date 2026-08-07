import { GIFT_PLAN, SUBSCRIPTION_PLANS } from './plans';

/**
 * How each euro of net income is allocated. Single source of truth — imported
 * by /api/transparency and by the "how farmers benefit" section on the home
 * page, so the published split and the computed one can never disagree.
 *
 * This is a *committed model*, not a historical measurement: it states how we
 * undertake to distribute incoming money from the date below onwards. The
 * accounting figures we actually booked live in the transparency grid and carry
 * their own "belegbar" note. Keeping the two claims apart matters — a funding
 * jury previously flagged unverifiable numbers presented as audited fact.
 */
export const ALLOCATION = {
  planting: 0.45,
  school: 0.3,
  operations: 0.15,
  reserve: 0.1,
} as const;

/** Rendered next to the split as "Stand: August 2026" (or its translation). */
export const ALLOCATION_AS_OF = { year: 2026, month: 8 } as const;

export type AllocationKey = keyof typeof ALLOCATION;

/** Ordered for display, largest share first. */
export const ALLOCATION_ORDER: readonly AllocationKey[] = ['planting', 'school', 'operations', 'reserve'];

export function allocationPercent(key: AllocationKey): number {
  return Math.round(ALLOCATION[key] * 100);
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * The shares must total exactly 100%, otherwise the published bar would not add
 * up and /api/transparency would silently lose or invent money. Cheap to check
 * at import time, and it fails loudly during the build rather than in front of
 * a donor.
 */
const allocationTotal = Object.values(ALLOCATION).reduce((sum, share) => sum + share, 0);
if (Math.abs(allocationTotal - 1) > 1e-9) {
  throw new Error(`ALLOCATION must sum to 1, got ${allocationTotal}`);
}

/**
 * Per-tree amounts implied by ALLOCATION and the real prices in lib/plans.ts.
 * Derived rather than typed out, so changing a plan price or a share cannot
 * leave a stale figure on the page.
 */
const careEurPerTreePerYear = Object.values(SUBSCRIPTION_PLANS).map((plan) =>
  round2((plan.priceMonthly * 12 * ALLOCATION.planting) / plan.treesPerMonth)
);

export const FARMER_ECONOMICS = {
  /** One-off tree (25 €): share that reaches the family as a planting day wage. */
  payPerTreePlantedEur: round2(GIFT_PLAN.priceOnce * ALLOCATION.planting),
  /** One-off tree (25 €): share that goes into the Zacapa school fund. */
  schoolFundPerTreePlantedEur: round2(GIFT_PLAN.priceOnce * ALLOCATION.school),
  /** Care wage per tree per year — a range, because it depends on the plan. */
  carePerTreePerYearEur: {
    min: Math.min(...careEurPerTreePerYear),
    max: Math.max(...careEurPerTreePerYear),
  },
  /** Published figure, kept in sync with Stats#familiesHelped. */
  familiesEmployed: 23,
  /** Price of the one-off tree the per-tree figures above are based on. */
  singleTreePriceEur: GIFT_PLAN.priceOnce,
} as const;
