export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const farmers = await prisma.farmer.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, farmers });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, photoUrl, location, storyEs, storyDe, storyEn, storyFr, storyAr, active } = body as {
    name?: string;
    photoUrl?: string;
    location?: string;
    storyEs?: string;
    storyDe?: string;
    storyEn?: string;
    storyFr?: string;
    storyAr?: string;
    active?: boolean;
  };

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const farmer = await prisma.farmer.create({
    data: {
      name: name.trim(),
      photoUrl: typeof photoUrl === 'string' ? photoUrl.trim() || null : null,
      location: typeof location === 'string' ? location.trim() || null : null,
      storyEs: typeof storyEs === 'string' ? storyEs.trim() || null : null,
      storyDe: typeof storyDe === 'string' ? storyDe.trim() || null : null,
      storyEn: typeof storyEn === 'string' ? storyEn.trim() || null : null,
      storyFr: typeof storyFr === 'string' ? storyFr.trim() || null : null,
      storyAr: typeof storyAr === 'string' ? storyAr.trim() || null : null,
      active: typeof active === 'boolean' ? active : true,
    },
  });

  return NextResponse.json({ success: true, farmer }, { status: 201 });
}
