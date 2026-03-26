export const dynamic = "force-dynamic";

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const PLANS = {
  cafe: { name: 'Plan Café', treesPerMonth: 1, priceEur: 60 },
  bosquePequeno: { name: 'Bosque Pequeño', treesPerMonth: 3, priceEur: 144 },
  bosqueGrande: { name: 'Bosque Grande', treesPerMonth: 10, priceEur: 420 },
};

function generateGiftCode(): string {
  return `QUETZ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

// POST - Create a gift
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { plan, recipientName, recipientEmail, occasion, message, sendDate, scheduledDate } = body;

    // Validation
    if (!plan || !recipientName || !recipientEmail) {
      return NextResponse.json(
        { error: 'Campos requeridos: plan, recipientName, recipientEmail' },
        { status: 400 }
      );
    }

    const planDetails = PLANS[plan as keyof typeof PLANS];
    if (!planDetails) {
      return NextResponse.json(
        { error: 'Plan inválido' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Email del destinatario inválido' },
        { status: 400 }
      );
    }

    const code = generateGiftCode();
    const scheduledAt = sendDate === 'scheduled' && scheduledDate 
      ? new Date(scheduledDate) 
      : null;

    // Create gift
    const gift = await prisma.gift.create({
      data: {
        code,
        planId: plan,
        planName: planDetails.name,
        treesPerMonth: planDetails.treesPerMonth,
        durationMonths: 12,
        amountEur: planDetails.priceEur,
        senderUserId: session?.user?.id || null,
        senderEmail: session?.user?.email || null,
        recipientName,
        recipientEmail,
        occasion: occasion || 'otro',
        message: message || null,
        scheduledAt,
        status: 'pending', // Will be 'paid' after Stripe checkout
      },
    });

    // TODO: In Phase 3, redirect to Stripe Checkout
    // For now, simulate payment success
    await prisma.gift.update({
      where: { id: gift.id },
      data: { 
        status: 'sent',
        sentAt: scheduledAt || new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Regalo creado exitosamente',
      giftId: gift.id,
      code: gift.code,
      redeemUrl: `/regalo/${gift.code}`,
    });
  } catch (error) {
    console.error('Error creating gift:', error);
    return NextResponse.json(
      { error: 'Error al crear el regalo' },
      { status: 500 }
    );
  }
}

// GET - Get gift by code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Código requerido' },
        { status: 400 }
      );
    }

    const gift = await prisma.gift.findUnique({
      where: { code },
    });

    if (!gift) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      gift: {
        code: gift.code,
        planName: gift.planName,
        treesPerMonth: gift.treesPerMonth,
        durationMonths: gift.durationMonths,
        recipientName: gift.recipientName,
        occasion: gift.occasion,
        message: gift.message,
        status: gift.status,
        activatedAt: gift.activatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching gift:', error);
    return NextResponse.json(
      { error: 'Error al obtener el regalo' },
      { status: 500 }
    );
  }
}
