export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const ADMIN_EMAILS = ['admin@quetz.com', 'john@doe.com', 'dgarrido@quetz.org', 'dfgarrido11@gmail.com'];

async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  if (ADMIN_EMAILS.includes(email)) return true;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return user?.role === 'admin';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!await isAdmin(session?.user?.email)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const adoptions = await prisma.adoption.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        tree: { select: { nameEs: true } },
        farmer: { select: { name: true } },
      },
    });

    const formattedAdoptions = adoptions.map(a => ({
      id: a.id,
      userId: a.userId,
      userName: a.user?.name || null,
      userEmail: a.user?.email || '',
      treeId: a.treeId,
      treeName: a.tree?.nameEs || 'Árbol',
      farmerId: a.farmerId,
      farmerName: a.farmer?.name || null,
      quantity: a.quantity,
      amount: a.amount,
      currency: a.currency,
      status: a.status,
      plantedAt: a.plantedAt?.toISOString() || null,
      progress: a.progress,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, adoptions: formattedAdoptions });
  } catch (error) {
    console.error('Adoptions GET error:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
