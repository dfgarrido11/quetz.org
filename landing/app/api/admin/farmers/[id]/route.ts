export const dynamic = "force-dynamic";

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
    const farmer = await prisma.farmer.findUnique({
      where: { id },
      include: {
        adoptions: {
          include: {
            tree: { select: { nameEs: true } },
            user: { select: { name: true, email: true } },
          },
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!farmer) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, farmer });
  } catch (error) {
    console.error('Farmer GET error:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(
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
    const { name, location, photoUrl, storyEs, storyDe, storyEn, storyFr, storyAr, active } = body;

    const farmer = await prisma.farmer.update({
      where: { id },
      data: {
        name,
        location,
        photoUrl: photoUrl || null,
        storyEs,
        storyDe: storyDe || null,
        storyEn: storyEn || null,
        storyFr: storyFr || null,
        storyAr: storyAr || null,
        active: active ?? true,
      },
    });

    return NextResponse.json({ success: true, farmer });
  } catch (error) {
    console.error('Farmer PUT error:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!await isAdmin(session?.user?.email)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    
    // Check if farmer has adoptions
    const adoptionCount = await prisma.adoption.count({ where: { farmerId: id } });
    if (adoptionCount > 0) {
      // Just deactivate instead of deleting
      await prisma.farmer.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({ success: true, message: 'Agricultor desactivado (tenía adopciones)' });
    }

    await prisma.farmer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Farmer DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar' }, { status: 500 });
  }
}
