export const revalidate = 60;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [agg, countResult] = await Promise.all([
    prisma.adoption.aggregate({
      _sum: { schoolFundEur: true },
      where: {
        status: { in: ['active', 'paid', 'completed'] },
        schoolFundEur: { not: null },
      },
    }),
    prisma.adoption.count({
      where: {
        status: { in: ['active', 'paid', 'completed'] },
        schoolFundEur: { not: null },
      },
    }),
  ]);

  const collected = Math.round((agg._sum.schoolFundEur ?? 0) * 100) / 100;
  const goal = 50000;
  const percent = Math.round((collected / goal) * 10000) / 100;

  return NextResponse.json({
    collected,
    goal,
    percent,
    contributorsCount: countResult,
    updatedAt: new Date().toISOString(),
  });
}
