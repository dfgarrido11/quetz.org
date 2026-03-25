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

    const metrics = await prisma.impactMetrics.findUnique({ where: { userId } });
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });
    const allBadges = await prisma.badge.findMany();

    // Average metrics for comparison
    const allMetrics = await prisma.impactMetrics.findMany();
    const avgTrees = (allMetrics?.length ?? 0) > 0
      ? (allMetrics?.reduce((s: number, m: any) => s + (m?.totalTrees ?? 0), 0) ?? 0) / (allMetrics?.length ?? 1)
      : 1;

    const multiplier = avgTrees > 0 ? ((metrics?.totalTrees ?? 0) / avgTrees).toFixed(1) : '1.0';

    // Monthly CO2 data for chart
    const trees = await prisma.tree.findMany({ where: { userId }, orderBy: { plantedDate: 'asc' } });
    const monthlyData: { month: string; co2: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      let co2 = 0;
      for (const t of (trees ?? [])) {
        const planted = new Date(t?.plantedDate ?? now);
        if (planted <= d) {
          const monthsOld = (d.getFullYear() - planted.getFullYear()) * 12 + d.getMonth() - planted.getMonth();
          co2 += monthsOld * 0.07;
        }
      }
      monthlyData.push({ month: monthStr, co2: parseFloat(co2.toFixed(1)) });
    }

    return NextResponse.json({
      metrics: metrics ?? { totalTrees: 0, totalCo2Tons: 0, schoolSqm: 0, childrenBenefited: 0 },
      badges: allBadges ?? [],
      earnedBadges: userBadges?.map((ub: any) => ub?.badgeId) ?? [],
      multiplier,
      monthlyCo2: monthlyData,
    });
  } catch (error: any) {
    console.error('Impact GET error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
