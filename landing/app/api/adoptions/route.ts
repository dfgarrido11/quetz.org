export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Round-robin farmer assignment
async function assignFarmer(): Promise<string | null> {
  const farmers = await prisma.farmer.findMany({
    where: { active: true },
    select: { id: true },
  });
  
  if (farmers.length === 0) return null;
  
  // Get adoption counts per farmer
  const farmerCounts = await prisma.adoption.groupBy({
    by: ['farmerId'],
    _count: { id: true },
    where: { farmerId: { not: null } },
  });
  
  const countMap = new Map(farmerCounts.map((f: { farmerId: string | null; _count: { id: number } }) => [f.farmerId, f._count.id]));
  
  // Find farmer with least adoptions
  let minFarmer = farmers[0].id;
  let minCount = countMap.get(farmers[0].id) || 0;
  
  for (const farmer of farmers) {
    const count = countMap.get(farmer.id) || 0;
    if (count < minCount) {
      minCount = count;
      minFarmer = farmer.id;
    }
  }
  
  return minFarmer;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const adoptions = await prisma.adoption.findMany({
      where: { userId: session.user.id },
      include: {
        tree: true,
        farmer: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ adoptions });
  } catch (error) {
    console.error('Error fetching adoptions:', error);
    return NextResponse.json({ error: 'Error al obtener adopciones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { treeId, quantity = 1, amount = 0, currency = 'EUR' } = body;

    if (!treeId) {
      return NextResponse.json({ error: 'Se requiere el ID del árbol' }, { status: 400 });
    }

    // Verify tree exists
    const tree = await prisma.tree.findUnique({ where: { id: treeId } });
    if (!tree) {
      return NextResponse.json({ error: 'Árbol no encontrado' }, { status: 404 });
    }

    const parsedQuantity = parseInt(String(quantity)) || 1;
    const parsedAmount = parseFloat(String(amount)) || 0;
    
    // Calculate social fund contribution (30% for adoptions)
    const socialFundPercentage = 0.3;
    const socialFundAmount = parsedAmount * socialFundPercentage;
    
    // Assign a farmer using round-robin
    const farmerId = await assignFarmer();
    
    // Calculate next update date (3 months from now)
    const nextUpdateAt = new Date();
    nextUpdateAt.setMonth(nextUpdateAt.getMonth() + 3);

    // Create adoption with full details
    const adoption = await prisma.adoption.create({
      data: {
        userId: session.user.id,
        treeId,
        farmerId,
        quantity: parsedQuantity,
        amount: parsedAmount,
        currency: currency,
        incomeType: 'subscription',
        socialFundPercentage,
        socialFundAmount,
        status: 'pending', // Will be 'paid' after Stripe webhook
        subscriptionStatus: 'pending',
        progress: 0,
        nextUpdateAt,
      },
      include: { 
        tree: true,
        farmer: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      adoption,
      message: 'Adopción creada. Procede al pago para confirmar.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating adoption:', error);
    return NextResponse.json({ error: 'Error al crear adopción' }, { status: 500 });
  }
}
