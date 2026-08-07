export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ALLOCATION } from '@/lib/allocation';

type TransparencyResponse = {
  // Raw gross
  totalRaisedEur: number;
  numTransactions: number;

  // Stripe fees (estimated — conservative rate for non-EEA cards)
  stripeFeesEur: number;
  stripeFeesEstimated: boolean;

  // Net
  netRaisedEur: number;

  // Allocation of net (40 / 30 / 20 / 10)
  plantingAllocation: number;
  schoolAllocation: number;
  operationsAllocation: number;
  reserveAllocation: number;

  // School project
  schoolAllocated: number;     // = schoolAllocation
  schoolTransferred: number;   // SchoolProject.raisedEur (what was actually sent)
  schoolPending: number;       // schoolAllocated - schoolTransferred
  schoolGoal: number;
  schoolPhase: string;
  schoolProgress: number;      // 2 decimal places, e.g. 0.03
  schoolGoalInTrees: number;   // trees needed to fully fund school
  treesNeededRemaining: number; // schoolGoalInTrees - treesAdopted

  // Tree impact
  treesAdopted: number;
  totalTrees: number;
  totalAdopters: number;
  jornalesFunded: number;      // = totalTrees (1 tree = 1 jornal)
  co2CapturedKg: number;       // totalTrees * 25
  hectaresReforested: number;  // totalTrees / 1000, 3 decimals

  lastUpdated: string;
};


const CO2_PER_TREE = 25;
const TREES_PER_HECTARE = 1000;

const FALLBACK: TransparencyResponse = {
  totalRaisedEur: 0,
  numTransactions: 0,
  stripeFeesEur: 0,
  stripeFeesEstimated: true,
  netRaisedEur: 0,
  plantingAllocation: 0,
  schoolAllocation: 0,
  operationsAllocation: 0,
  reserveAllocation: 0,
  schoolAllocated: 0,
  schoolTransferred: 0,
  schoolPending: 0,
  schoolGoal: 50000,
  schoolPhase: 'terreno',
  schoolProgress: 0,
  schoolGoalInTrees: 0,
  treesNeededRemaining: 0,
  treesAdopted: 0,
  totalTrees: 0,
  totalAdopters: 0,
  jornalesFunded: 0,
  co2CapturedKg: 0,
  hectaresReforested: 0,
  lastUpdated: new Date().toISOString(),
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export async function GET(): Promise<NextResponse<TransparencyResponse>> {
  try {
    const [adoptions, schoolProject] = await Promise.all([
      prisma.adoption.findMany({
        where: { status: { in: ['paid', 'active', 'completed'] } },
        select: { amount: true, quantity: true, userId: true },
      }),
      prisma.schoolProject.findUnique({ where: { id: 'zacapa' } }),
    ]);

    const numTransactions = adoptions.length;
    let totalRaisedEur = 0;
    let totalTrees = 0;
    const adopterIds = new Set<string>();

    for (const a of adoptions) {
      totalRaisedEur += a.amount;
      totalTrees += a.quantity;
      adopterIds.add(a.userId);
    }

    // Stripe fees: conservative estimate covering non-EEA cards
    // 3.4% + €0.35 per transaction
    const stripeFeesEur = round2(totalRaisedEur * 0.034 + numTransactions * 0.35);
    const netRaisedEur = round2(totalRaisedEur - stripeFeesEur);

    const plantingAllocation = round2(netRaisedEur * ALLOCATION.planting);
    const schoolAllocation = round2(netRaisedEur * ALLOCATION.school);
    const operationsAllocation = round2(netRaisedEur * ALLOCATION.operations);
    const reserveAllocation = round2(netRaisedEur * ALLOCATION.reserve);

    const schoolGoal = schoolProject?.goalEur ?? 50000;
    const schoolTransferred = schoolProject?.raisedEur ?? 0;
    const schoolPhase = schoolProject?.phase ?? 'terreno';
    const schoolAllocated = schoolAllocation;
    const schoolPending = round2(Math.max(0, schoolAllocated - schoolTransferred));

    // schoolProgress as percentage with 2 decimal places (e.g. 0.03)
    const schoolProgress = round2((schoolTransferred / schoolGoal) * 100);

    // Dynamic: how many trees needed to fund school via 30% of net price
    const avgTreePriceEur = totalTrees > 0 ? round2(totalRaisedEur / totalTrees) : 25;
    const netPerTree = round2(avgTreePriceEur * (1 - 0.034) - 0.35); // net per tree after Stripe
    const schoolPerTree = round2(netPerTree * ALLOCATION.school);
    const schoolGoalInTrees = schoolPerTree > 0 ? Math.ceil(schoolGoal / schoolPerTree) : 0;
    const treesNeededRemaining = Math.max(0, schoolGoalInTrees - totalTrees);

    return NextResponse.json({
      totalRaisedEur: round2(totalRaisedEur),
      numTransactions,
      stripeFeesEur,
      stripeFeesEstimated: true,
      netRaisedEur,
      plantingAllocation,
      schoolAllocation,
      operationsAllocation,
      reserveAllocation,
      schoolAllocated,
      schoolTransferred,
      schoolPending,
      schoolGoal,
      schoolPhase,
      schoolProgress,
      schoolGoalInTrees,
      treesNeededRemaining,
      treesAdopted: totalTrees,
      totalTrees,
      totalAdopters: adopterIds.size,
      jornalesFunded: totalTrees,
      co2CapturedKg: totalTrees * CO2_PER_TREE,
      hectaresReforested: round3(totalTrees / TREES_PER_HECTARE),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[transparency GET]', message);
    return NextResponse.json(FALLBACK, { status: 500 });
  }
}
