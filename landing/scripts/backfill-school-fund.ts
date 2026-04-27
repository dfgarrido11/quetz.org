/**
 * Backfill script — run ONCE after deploy to populate schoolFundEur on
 * existing Adoption records that predate the school fund tracking feature.
 *
 * For each adoption without schoolFundEur:
 *   1. Uses amount (gross) already stored in the DB
 *   2. Conservative Stripe fee estimate: 1.5% + €0.25 (stripeFeeEstimated=true)
 *   3. net = gross - fee ; schoolFund = net * 0.30
 *
 * Historical records cannot be looked up in Stripe because no stripeSessionId
 * was stored on the Adoption model — estimate is the correct approach here.
 *
 * Usage:
 *   cd landing && npx tsx scripts/backfill-school-fund.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adoptions = await prisma.adoption.findMany({
    where: { schoolFundEur: null, amount: { gt: 0 } },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${adoptions.length} adoptions without schoolFundEur`);

  if (adoptions.length === 0) {
    console.log('Nothing to backfill — all adoptions already have schoolFundEur.');
    return;
  }

  let updated = 0;
  let totalGross = 0;
  let totalFee = 0;
  let totalNet = 0;
  let totalSchoolFund = 0;

  for (const adoption of adoptions) {
    const grossEur = adoption.amount;

    // Conservative estimate: Stripe standard EU rate ≈ 1.5% + €0.25
    const stripeFeeEur = Math.round((grossEur * 0.015 + 0.25) * 100) / 100;
    const netEur = Math.round((grossEur - stripeFeeEur) * 100) / 100;
    const schoolFundEur = Math.round(netEur * 0.30 * 100) / 100;

    await prisma.adoption.update({
      where: { id: adoption.id },
      data: {
        grossEur,
        stripeFeeEur,
        netEur,
        schoolFundEur,
        stripeFeeEstimated: true,
      },
    });

    updated++;
    totalGross += grossEur;
    totalFee += stripeFeeEur;
    totalNet += netEur;
    totalSchoolFund += schoolFundEur;

    console.log(
      `[${updated}/${adoptions.length}] id=${adoption.id}` +
      ` gross=€${grossEur.toFixed(2)}` +
      ` fee~€${stripeFeeEur.toFixed(2)}` +
      ` net=€${netEur.toFixed(2)}` +
      ` school=€${schoolFundEur.toFixed(2)}`
    );
  }

  console.log('\n── Backfill complete ──────────────────────────');
  console.log(`Records updated:    ${updated}`);
  console.log(`All fees estimated: yes (stripeFeeEstimated=true)`);
  console.log(`Total gross:        €${totalGross.toFixed(2)}`);
  console.log(`Total fees:         €${totalFee.toFixed(2)}`);
  console.log(`Total net:          €${totalNet.toFixed(2)}`);
  console.log(`Total school fund:  €${totalSchoolFund.toFixed(2)}`);
  console.log('───────────────────────────────────────────────');
}

main()
  .catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
