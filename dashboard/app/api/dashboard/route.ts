export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = (session.user as any)?.id;
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const [user, trees, metrics, userBadges, assignment] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, subscriptionStart: true } }),
      prisma.tree.findMany({ where: { userId }, orderBy: { plantedDate: 'desc' }, take: 3 }),
      prisma.impactMetrics.findUnique({ where: { userId } }),
      prisma.userBadge.findMany({ where: { userId }, include: { badge: true }, take: 3, orderBy: { earnedAt: 'desc' } }),
      prisma.userGuardianAssignment.findUnique({ where: { userId }, include: { guardian: true } }),
    ]);

    return NextResponse.json({
      user,
      recentTrees: trees ?? [],
      metrics: metrics ?? { totalTrees: 0, totalCo2Tons: 0, schoolSqm: 0, childrenBenefited: 0 },
      recentBadges: userBadges ?? [],
      guardian: assignment?.guardian ?? null,
    });
  } catch (error: any) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
