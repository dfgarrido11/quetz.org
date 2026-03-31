export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adoptions = await prisma.adoption.findMany({
      where: { userId: session.user.id },
      include: {
        tree: true,
        farmer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(adoptions);
  } catch (err: any) {
    console.error('[adoptions GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
