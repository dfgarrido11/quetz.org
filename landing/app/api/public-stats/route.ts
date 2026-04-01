export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [stats, schoolProject] = await Promise.all([
      prisma.stats.findUnique({ where: { id: 'main' } }),
      prisma.schoolProject.findUnique({ where: { id: 'zacapa' } }),
    ]);

    return NextResponse.json({
      treesAdopted: stats?.treesAdopted ?? 0,
      treesPlanted: stats?.treesPlanted ?? 0,
      familiesHelped: stats?.familiesHelped ?? 0,
      co2CapturedKg: stats?.co2CapturedKg ?? 0,
      totalIncome: stats?.totalIncome ?? 0,
      socialFund: stats?.socialFund ?? 0,
      schoolFunding: stats?.schoolFunding ?? 0,
      schoolProgress: stats?.schoolProgress ?? 0,
      schoolGoal: schoolProject?.goalEur ?? 50000,
      schoolRaised: schoolProject?.raisedEur ?? 0,
      schoolPhase: schoolProject?.phase ?? 'terreno',
    });
  } catch (err: any) {
    console.error('[public-stats GET]', err);
    return NextResponse.json({
      treesAdopted: 0,
      treesPlanted: 0,
      familiesHelped: 0,
      co2CapturedKg: 0,
      totalIncome: 0,
      socialFund: 0,
      schoolFunding: 0,
      schoolProgress: 0,
      schoolGoal: 50000,
      schoolRaised: 0,
      schoolPhase: 'terreno',
    });
  }
}
