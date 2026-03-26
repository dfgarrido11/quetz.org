export const dynamic = "force-dynamic";



import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get user's donations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const donations = await prisma.donation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ error: 'Error al obtener donaciones' }, { status: 500 });
  }
}

// POST - Create a new donation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency, purpose } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    // Create the donation
    const donation = await prisma.donation.create({
      data: {
        userId: session.user.id,
        amount: parseFloat(amount),
        currency: currency || 'EUR',
        purpose: purpose || 'school',
        status: 'pending',
      },
    });

    // Update stats if school donation
    if (purpose === 'school') {
      await prisma.stats.upsert({
        where: { id: 'main' },
        create: {
          id: 'main',
          totalIncome: parseFloat(amount),
          socialFund: parseFloat(amount) * 0.3,
          schoolFunding: parseFloat(amount),
          treesPlanted: 0,
          familiesHelped: 0,
        },
        update: {
          totalIncome: { increment: parseFloat(amount) },
          socialFund: { increment: parseFloat(amount) * 0.3 },
          schoolFunding: { increment: parseFloat(amount) },
        },
      });
    }

    return NextResponse.json({ success: true, donation });
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json({ error: 'Error al crear donación' }, { status: 500 });
  }
}
