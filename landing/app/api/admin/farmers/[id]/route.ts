export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { FORBIDDEN, optionalString, readJson, requireAdmin } from '@/lib/admin-auth';

/**
 * The admin farmer modal has always issued PUT /api/admin/farmers/:id to edit
 * and the list page DELETE /api/admin/farmers/:id to remove, but this route
 * did not exist — both calls 404'd and surfaced as "Error" in the UI.
 */

interface RouteContext {
  params: { id: string };
}

const STORY_FIELDS = ['storyEs', 'storyDe', 'storyEn', 'storyFr', 'storyAr'] as const;

export async function PUT(req: NextRequest, { params }: RouteContext) {
  if (!(await requireAdmin())) return FORBIDDEN();

  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = optionalString(body.name);
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const data: Prisma.FarmerUpdateInput = {
    name,
    photoUrl: optionalString(body.photoUrl),
    location: optionalString(body.location),
    active: typeof body.active === 'boolean' ? body.active : true,
  };
  for (const field of STORY_FIELDS) {
    data[field] = optionalString(body[field]);
  }

  try {
    const farmer = await prisma.farmer.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, farmer });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }
    console.error('[admin/farmers PUT]', error);
    return NextResponse.json({ error: 'Could not update farmer' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  if (!(await requireAdmin())) return FORBIDDEN();

  try {
    // Adoption.farmerId has no cascade, so a farmer with adoptions cannot be
    // deleted without orphaning them. Deactivate instead — this keeps the
    // adoption history intact and is what the UI's "active" flag expects.
    const adoptionCount = await prisma.adoption.count({ where: { farmerId: params.id } });

    if (adoptionCount > 0) {
      const farmer = await prisma.farmer.update({
        where: { id: params.id },
        data: { active: false },
      });
      return NextResponse.json({
        success: true,
        deactivated: true,
        adoptionCount,
        farmer,
        message: `Agricultor desactivado (tiene ${adoptionCount} adopción/es asignadas, no se puede borrar sin perder el historial).`,
      });
    }

    await prisma.farmer.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, deactivated: false });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }
    console.error('[admin/farmers DELETE]', error);
    return NextResponse.json({ error: 'Could not delete farmer' }, { status: 500 });
  }
}
