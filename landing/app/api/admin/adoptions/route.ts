export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  return user?.role === 'admin' ? user : null;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.toLowerCase() ?? '';

  const adoptions = await prisma.adoption.findMany({
    where: {
      ...(status && status !== 'all' ? { status } : {}),
    },
    include: {
      user: { select: { email: true, name: true } },
      tree: { select: { species: true, nameEs: true } },
      farmer: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const filtered = q
    ? adoptions.filter((a) => {
        const email = a.user?.email?.toLowerCase() ?? '';
        const species = a.tree?.species?.toLowerCase() ?? '';
        const nameEs = a.tree?.nameEs?.toLowerCase() ?? '';
        return email.includes(q) || species.includes(q) || nameEs.includes(q);
      })
    : adoptions;

  return NextResponse.json({
    success: true,
    adoptions: filtered.map((a) => ({
      id: a.id,
      userId: a.userId,
      userEmail: a.user?.email ?? null,
      userName: a.user?.name ?? null,
      treeId: a.treeId ?? null,
      treeSpecies: a.tree?.species ?? null,
      treeName: a.tree?.nameEs ?? null,
      farmerId: a.farmerId ?? null,
      farmerName: a.farmer?.name ?? null,
      quantity: a.quantity,
      amount: a.amount,
      currency: a.currency,
      status: a.status,
      plantedAt: a.plantedAt?.toISOString() ?? null,
      progress: a.progress,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
