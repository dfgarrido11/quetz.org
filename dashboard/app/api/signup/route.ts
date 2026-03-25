export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name ?? '',
        subscriptionStart: new Date(),
      },
    });

    // Assign a random guardian
    const guardians = await prisma.guardian.findMany();
    if (guardians?.length > 0) {
      const randomGuardian = guardians[Math.floor(Math.random() * guardians.length)];
      await prisma.userGuardianAssignment.create({
        data: { userId: user.id, guardianId: randomGuardian.id },
      });
    }

    // Create initial impact metrics
    await prisma.impactMetrics.create({
      data: { userId: user.id, totalTrees: 0, totalCo2Tons: 0, schoolSqm: 0, childrenBenefited: 0 },
    });

    // Create first tree
    await prisma.tree.create({
      data: {
        userId: user.id,
        name: 'Mi Primer Árbol',
        plantedDate: new Date(),
        locationGps: '14.9720, -89.5228',
        photoUrl: 'https://thumbs.dreamstime.com/b/hand-nurturing-young-green-plant-fertile-soil-close-up-human-gently-placing-small-seedling-dark-under-natural-375374626.jpg',
        growthStage: 'seed',
        co2Captured: 0,
        species: 'Ceiba',
      },
    });

    // Award first tree badge
    const firstTreeBadge = await prisma.badge.findFirst({ where: { criteria: 'first_tree' } });
    if (firstTreeBadge) {
      await prisma.userBadge.create({
        data: { userId: user.id, badgeId: firstTreeBadge.id },
      });
    }

    // Update impact
    await prisma.impactMetrics.update({
      where: { userId: user.id },
      data: { totalTrees: 1 },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 });
  }
}
