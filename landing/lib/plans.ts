export const ALL_SPECIES = [
  'cafe', 'aguacate', 'caoba', 'mango', 'cacao',
  'cedro', 'naranja', 'limon', 'pino', 'cipres',
] as const;

export type Species = (typeof ALL_SPECIES)[number];

// Plan Café solo permite pino y ciprés — el nombre "Café" es por PRECIO, no por especie
export const PLAN_CAFE_SPECIES: Species[] = ['pino', 'cipres'];

const ALL_SPECIES_LIST = [...ALL_SPECIES] as Species[];

export const PLANS = {
  cafe: {
    id: 'cafe',
    name: 'Plan Café',
    nameDE: 'Kaffee-Plan',
    priceEur: 5,
    interval: 'monthly' as const,
    treesPerMonth: 1,
    allowedSpecies: PLAN_CAFE_SPECIES,
    namingNote: 'Nombre por precio (cuesta como un café), NO por especie',
  },
  bosquePequeno: {
    id: 'bosque-pequeno',
    name: 'Plan Bosque Pequeño',
    nameDE: 'Kleiner Wald',
    priceEur: 12,
    interval: 'monthly' as const,
    treesPerMonth: 3,
    allowedSpecies: ALL_SPECIES_LIST,
  },
  bosqueGrande: {
    id: 'bosque-grande',
    name: 'Plan Bosque Grande',
    nameDE: 'Großer Wald',
    priceEur: 35,
    interval: 'monthly' as const,
    treesPerMonth: 10,
    allowedSpecies: ALL_SPECIES_LIST,
  },
  gift: {
    id: 'gift',
    name: 'Adopción regalo',
    nameDE: 'Geschenk-Adoption',
    priceEur: 25,
    interval: 'one-time' as const,
    treesPerMonth: 1,
    allowedSpecies: ALL_SPECIES_LIST,
  },
} as const;

export const SCHOOL_FUND_PERCENT = 0.30;  // 30% del NETO va a escuela
export const SCHOOL_FUND_GOAL_EUR = 50000;
