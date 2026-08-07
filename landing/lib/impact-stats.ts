import { prisma } from '@/lib/prisma';

/**
 * Single source of truth for the public impact numbers shown on the home page
 * (transparency grid + school progress bar).
 *
 * These are read server-side so the numbers are present in the initial HTML.
 * Before, the counters lived only in client `useEffect` state, which meant the
 * server rendered literal zeros — visible to crawlers, to users with JS
 * disabled, and to anyone whose hydration was slow or failed.
 *
 * The DB rows (`Stats#main`, `SchoolProject#zacapa`) are authoritative.
 * IMPACT_FALLBACK is only used when a value is missing or the DB is unreachable,
 * so the section can never render zeros.
 */

export interface ImpactStats {
  totalIncome: number;
  socialFund: number;
  treesPlanted: number;
  familiesHelped: number;
  schoolRaised: number;
  schoolGoal: number;
  schoolProgress: number;
  /** true when any value came from IMPACT_FALLBACK instead of the DB */
  usedFallback: boolean;
}

export const IMPACT_FALLBACK = {
  totalIncome: 5420.2,
  socialFund: 1626.06,
  treesPlanted: 847,
  familiesHelped: 23,
  schoolRaised: 5420.2,
  schoolGoal: 50000,
} as const;

/** Returns `value` unless it is missing/zero/negative, in which case `fallback`. */
function orFallback(value: number | null | undefined, fallback: number): { value: number; usedFallback: boolean } {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return { value: fallback, usedFallback: true };
  }
  return { value, usedFallback: false };
}

function buildStats(
  raw: Partial<Record<keyof typeof IMPACT_FALLBACK, number | null | undefined>>,
  dbUnreachable = false,
): ImpactStats {
  const totalIncome = orFallback(raw.totalIncome, IMPACT_FALLBACK.totalIncome);
  const socialFund = orFallback(raw.socialFund, IMPACT_FALLBACK.socialFund);
  const treesPlanted = orFallback(raw.treesPlanted, IMPACT_FALLBACK.treesPlanted);
  const familiesHelped = orFallback(raw.familiesHelped, IMPACT_FALLBACK.familiesHelped);
  const schoolRaised = orFallback(raw.schoolRaised, IMPACT_FALLBACK.schoolRaised);
  const schoolGoal = orFallback(raw.schoolGoal, IMPACT_FALLBACK.schoolGoal);

  return {
    totalIncome: totalIncome.value,
    socialFund: socialFund.value,
    treesPlanted: Math.round(treesPlanted.value),
    familiesHelped: Math.round(familiesHelped.value),
    schoolRaised: schoolRaised.value,
    schoolGoal: schoolGoal.value,
    schoolProgress: Math.min(100, (schoolRaised.value / schoolGoal.value) * 100),
    usedFallback:
      dbUnreachable ||
      totalIncome.usedFallback ||
      socialFund.usedFallback ||
      treesPlanted.usedFallback ||
      familiesHelped.usedFallback ||
      schoolRaised.usedFallback ||
      schoolGoal.usedFallback,
  };
}

export async function getImpactStats(): Promise<ImpactStats> {
  try {
    const [stats, school] = await Promise.all([
      prisma.stats.findUnique({ where: { id: 'main' } }),
      prisma.schoolProject.findUnique({ where: { id: 'zacapa' } }),
    ]);

    return buildStats({
      totalIncome: stats?.totalIncome,
      socialFund: stats?.socialFund,
      treesPlanted: stats?.treesPlanted,
      familiesHelped: stats?.familiesHelped,
      schoolRaised: school?.raisedEur,
      schoolGoal: school?.goalEur,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getImpactStats] falling back to static values:', message);
    return buildStats({}, true);
  }
}
