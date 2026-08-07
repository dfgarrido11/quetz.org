/**
 * Seeds the public impact numbers shown on the home page.
 *
 * The `Stats#main` row did not exist in production, which is why
 * /api/public-stats returned zeros for every metric. `SchoolProject#zacapa`
 * existed but held a stale 15 EUR test value (and the old "Jumuzna" name).
 *
 * Run with:  npx tsx --require dotenv/config scripts/seed-impact-stats.ts
 *
 * Idempotent: safe to re-run. Update the values here (or via /admin) whenever
 * Daniel closes a month.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IMPACT = {
  totalIncome: 5420.2,
  socialFund: 1626.06,
  treesAdopted: 847,
  treesPlanted: 847,
  familiesHelped: 23,
  co2CapturedKg: 847 * 25,
  schoolFunding: 5420.2,
  schoolProgress: 10.84,
};

const SCHOOL = {
  name: 'Escuela Zacapa',
  description:
    'Construcción de escuela primaria para 120 niños en Zacapa, Guatemala. Financiada con el fondo social de cada adopción.',
  goalEur: 50000,
  raisedEur: 5420.2,
  phase: 'terreno',
};

async function main(): Promise<void> {
  const stats = await prisma.stats.upsert({
    where: { id: 'main' },
    create: { id: 'main', ...IMPACT },
    update: IMPACT,
  });
  console.log('Stats#main seeded:', stats);

  const school = await prisma.schoolProject.upsert({
    where: { id: 'zacapa' },
    create: { id: 'zacapa', ...SCHOOL },
    update: SCHOOL,
  });
  console.log('SchoolProject#zacapa seeded:', school);
}

main()
  .catch((error: unknown) => {
    console.error('[seed-impact-stats] failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
