export const dynamic = "force-dynamic";




import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Activate a gift
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para activar tu regalo' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Código requerido' },
        { status: 400 }
      );
    }

    // Find gift
    const gift = await prisma.gift.findUnique({
      where: { code },
    });

    if (!gift) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      );
    }

    // Check if already activated
    if (gift.status === 'activated') {
      return NextResponse.json(
        { error: 'Este regalo ya ha sido activado' },
        { status: 400 }
      );
    }

    // Check valid status
    if (gift.status !== 'sent' && gift.status !== 'paid') {
      return NextResponse.json(
        { error: 'Este regalo no está disponible para activación' },
        { status: 400 }
      );
    }

    // Get a pine/cypress tree (for subscription plans)
    const tree = await prisma.tree.findFirst({
      where: { 
        OR: [
          { species: 'pino' },
          { species: 'cipres' },
          { species: 'cedro' }, // fallback
        ],
        active: true 
      },
    });

    if (!tree) {
      // Fallback to any active tree
      const anyTree = await prisma.tree.findFirst({ where: { active: true } });
      if (!anyTree) {
        return NextResponse.json(
          { error: 'No hay árboles disponibles' },
          { status: 500 }
        );
      }
    }

    const selectedTree = tree || await prisma.tree.findFirst({ where: { active: true } });

    // Activate gift and create adoption
    const [updatedGift, adoption] = await prisma.$transaction([
      // Update gift status
      prisma.gift.update({
        where: { id: gift.id },
        data: {
          status: 'activated',
          activatedAt: new Date(),
          activatedByUserId: session.user.id,
        },
      }),
      // Create adoption for the total trees
      prisma.adoption.create({
        data: {
          userId: session.user.id,
          treeId: selectedTree!.id,
          quantity: gift.treesPerMonth * gift.durationMonths,
          amount: gift.amountEur,
          currency: 'EUR',
          status: 'paid',
          subscriptionStatus: 'active',
          incomeType: 'gift',
          socialFundPercentage: 0.3,
          socialFundAmount: gift.amountEur * 0.3,
          progress: 5,
        },
      }),
    ]);

    // Update global stats
    await prisma.stats.upsert({
      where: { id: 'main' },
      update: {
        totalIncome: { increment: gift.amountEur },
        socialFund: { increment: gift.amountEur * 0.3 },
        treesAdopted: { increment: gift.treesPerMonth * gift.durationMonths },
      },
      create: {
        id: 'main',
        totalIncome: gift.amountEur,
        socialFund: gift.amountEur * 0.3,
        treesAdopted: gift.treesPerMonth * gift.durationMonths,
      },
    });

    return NextResponse.json({
      success: true,
      message: '¡Regalo activado! Ya puedes ver tus árboles en Mi Bosque.',
      adoptionId: adoption.id,
      totalTrees: gift.treesPerMonth * gift.durationMonths,
    });
  } catch (error) {
    console.error('Error activating gift:', error);
    return NextResponse.json(
      { error: 'Error al activar el regalo' },
      { status: 500 }
    );
  }
}
