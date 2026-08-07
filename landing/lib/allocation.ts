/**
 * How each euro of net income is allocated. Single source of truth — imported
 * by /api/transparency and by the "how farmers benefit" section on the home
 * page, so the published split and the computed one can never disagree.
 */
export const ALLOCATION = {
  planting: 0.4,
  school: 0.3,
  operations: 0.2,
  reserve: 0.1,
} as const;

export type AllocationKey = keyof typeof ALLOCATION;

/** Ordered for display, largest share first. */
export const ALLOCATION_ORDER: readonly AllocationKey[] = ['planting', 'school', 'operations', 'reserve'];

export function allocationPercent(key: AllocationKey): number {
  return Math.round(ALLOCATION[key] * 100);
}

/**
 * Field economics that only Daniel can confirm. Left null on purpose: the
 * section renders an honest "not yet published" note rather than a number we
 * cannot stand behind. A funding jury already flagged unverifiable figures.
 */
export const FARMER_ECONOMICS: {
  payPerTreePlantedEur: number | null;
  payPerTreeCarePerYearEur: number | null;
  averageDailyWageEur: number | null;
  familiesEmployed: number;
} = {
  // TODO-DANIEL: importe real pagado a la familia por cada árbol plantado (jornal de plantación).
  payPerTreePlantedEur: null,
  // TODO-DANIEL: importe real por árbol y año de cuidado/mantenimiento (riego, poda, reposición).
  payPerTreeCarePerYearEur: null,
  // TODO-DANIEL: jornal medio diario en Zacapa, para poder comparar con el salario mínimo agrícola de Guatemala.
  averageDailyWageEur: null,
  // Published figure, kept in sync with Stats#familiesHelped (see scripts/seed-impact-stats.ts).
  familiesEmployed: 23,
};
