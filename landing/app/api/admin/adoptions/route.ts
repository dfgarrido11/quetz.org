import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Adoption } from '@prisma/client';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const adoptions = await prisma.adoption.findMany({
      include: {
        user: true,
        tree: true,
        farmer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedAdoptions = adoptions.map((a: Adoption) => ({
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

    return NextResponse.json(formattedAdoptions);
  } catch (error) {
    console.error('Error fetching adoptions:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// Si tienes POST, PUT, etc., mantenlos igual, pero asegúrate de tipar también.
