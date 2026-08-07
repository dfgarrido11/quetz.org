export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { FORBIDDEN, readJson, requireAdmin } from '@/lib/admin-auth';

/**
 * The adoptions admin page issues PATCH /api/admin/adoptions/:id to assign a
 * farmer, mark a tree as planted and change status. The route did not exist,
 * so all three buttons silently did nothing (`res.ok` was false, so the page
 * never even reloaded).
 */

interface RouteContext {
  params: { id: string };
}

const ALLOWED_STATUSES = ['pending', 'paid', 'active', 'completed', 'cancelled'] as const;
type AdoptionStatus = (typeof ALLOWED_STATUSES)[number];

function isStatus(value: unknown): value is AdoptionStatus {
  return typeof value === 'string' && (ALLOWED_STATUSES as readonly string[]).includes(value);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  if (!(await requireAdmin())) return FORBIDDEN();

  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const data: Prisma.AdoptionUpdateInput = {};

  if ('farmerId' in body) {
    const farmerId = body.farmerId;
    if (farmerId === null || farmerId === '') {
      data.farmer = { disconnect: true };
    } else if (typeof farmerId === 'string') {
      const farmer = await prisma.farmer.findUnique({ where: { id: farmerId }, select: { id: true } });
      if (!farmer) {
        return NextResponse.json({ error: 'Farmer not found' }, { status: 400 });
      }
      data.farmer = { connect: { id: farmerId } };
    } else {
      return NextResponse.json({ error: 'farmerId must be a string or null' }, { status: 400 });
    }
  }

  if ('plantedAt' in body) {
    const { plantedAt } = body;
    if (plantedAt === null) {
      data.plantedAt = null;
    } else if (typeof plantedAt === 'string') {
      const parsed = new Date(plantedAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'plantedAt must be an ISO date' }, { status: 400 });
      }
      data.plantedAt = parsed;
      // Marking a tree as planted is what moves an adoption past 0% progress.
      data.progress = typeof body.progress === 'number' ? body.progress : 100;
    } else {
      return NextResponse.json({ error: 'plantedAt must be an ISO date or null' }, { status: 400 });
    }
  }

  if ('status' in body) {
    if (!isStatus(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }
    data.status = body.status;
    if (body.status === 'cancelled') {
      data.cancelledAt = new Date();
    }
  }

  if ('progress' in body && !('plantedAt' in body)) {
    const { progress } = body;
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json({ error: 'progress must be a number 0-100' }, { status: 400 });
    }
    data.progress = Math.round(progress);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No supported fields to update' }, { status: 400 });
  }

  try {
    const adoption = await prisma.adoption.update({
      where: { id: params.id },
      data,
      include: {
        user: { select: { name: true, email: true } },
        farmer: { select: { name: true } },
        tree: { select: { nameEs: true, species: true } },
      },
    });
    return NextResponse.json({ success: true, adoption });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Adoption not found' }, { status: 404 });
    }
    console.error('[admin/adoptions PATCH]', error);
    return NextResponse.json({ error: 'Could not update adoption' }, { status: 500 });
  }
}
