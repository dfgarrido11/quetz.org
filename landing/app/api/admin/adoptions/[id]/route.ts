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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!await isAdmin(session?.user?.email)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const adoption = await prisma.adoption.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        tree: true,
        farmer: true,
      },
    });

    if (!adoption) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, adoption });
  } catch (error) {
    console.error('Adoption GET error:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!await isAdmin(session?.user?.email)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { farmerId, plantedAt, status, progress } = body;

    const updateData: Record<string, unknown> = {};

    if (farmerId !== undefined) {
      updateData.farmerId = farmerId;
    }

    if (plantedAt !== undefined) {
      updateData.plantedAt = plantedAt ? new Date(plantedAt) : null;
      // Also update stats when marking as planted
      if (plantedAt) {
        const adoption = await prisma.adoption.findUnique({ 
          where: { id },
          select: { quantity: true, plantedAt: true }
        });
        if (adoption && !adoption.plantedAt) {
          // First time marking as planted
          await prisma.stats.update({
            where: { id: 'main' },
            data: { treesPlanted: { increment: adoption.quantity } },
          });
        }
      }
    }

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'active') {
        updateData.subscriptionStatus = 'active';
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
        updateData.subscriptionStatus = 'cancelled';
      } else if (status === 'completed') {
        updateData.subscriptionStatus = 'completed';
      }
    }

    if (progress !== undefined) {
      updateData.progress = progress;
    }

    const adoption = await prisma.adoption.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, adoption });
  } catch (error) {
    console.error('Adoption PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar' }, { status: 500 });
  }
}
