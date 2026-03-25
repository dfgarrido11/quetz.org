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

    const farmers = await prisma.farmer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { adoptions: true } },
      },
    });

    const formattedFarmers = farmers.map(f => ({
      id: f.id,
      name: f.name,
      photoUrl: f.photoUrl,
      location: f.location,
      storyEs: f.storyEs,
      active: f.active,
      adoptionCount: f._count.adoptions,
      totalPayments: Array.isArray(f.payments) 
        ? (f.payments as Array<{ amount: number }>).reduce((sum, p) => sum + (p.amount || 0), 0)
        : 0,
      createdAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, farmers: formattedFarmers });
  } catch (error) {
    console.error('Farmers GET error:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!await isAdmin(session?.user?.email)) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { name, location, photoUrl, storyEs, storyDe, storyEn, storyFr, storyAr, active } = body;

    if (!name || !location || !storyEs) {
      return NextResponse.json({ success: false, error: 'Campos requeridos: nombre, ubicación, historia' }, { status: 400 });
    }

    const farmer = await prisma.farmer.create({
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
        payments: [],
      },
    });

    return NextResponse.json({ success: true, farmer });
  } catch (error) {
    console.error('Farmers POST error:', error);
    return NextResponse.json({ success: false, error: 'Error al crear' }, { status: 500 });
  }
}
