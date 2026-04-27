export const ALL_SPECIES = [
  'cafe', 'aguacate', 'caoba', 'mango', 'cacao',
  'cedro', 'naranja', 'limon', 'pino', 'cipres',
] as const;

export type Species = (typeof ALL_SPECIES)[number];

// Plan Café solo permite pino y ciprés — el nombre "Café" es por PRECIO, no por especie
export const PLAN_CAFE_SPECIES: Species[] = ['pino', 'cipres'];

const ALL_SPECIES_LIST = [...ALL_SPECIES] as Species[];

export const PLANS = {
  PLAN_CAFE: {
    id: 'cafe',
    name: 'Plan Café',
    priceEur: 5,
    treesPerMonth: 1,
    allowedSpecies: PLAN_CAFE_SPECIES,
  },
  PLAN_BOSQUE_PEQUENO: {
    id: 'bosquePequeno',
    name: 'Plan Bosque Pequeño',
    priceEur: 12,
    treesPerMonth: 3,
    allowedSpecies: ALL_SPECIES_LIST,
  },
  PLAN_BOSQUE_GRANDE: {
    id: 'bosqueGrande',
    name: 'Plan Bosque Grande',
    priceEur: 35,
    treesPerMonth: 10,
    allowedSpecies: ALL_SPECIES_LIST,
  },
  GIFT_ADOPTION: {
    id: 'regalo',
    name: 'Adopción regalo',
    priceEur: 25,
    treesPerMonth: 0,
    allowedSpecies: ALL_SPECIES_LIST,
  },
} as const;
