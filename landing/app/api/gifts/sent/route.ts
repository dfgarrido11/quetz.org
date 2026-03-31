export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gifts = await prisma.gift.findMany({
      where: { senderEmail: session.user.email },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(gifts);
  } catch (err: any) {
    console.error('[gifts/sent GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
