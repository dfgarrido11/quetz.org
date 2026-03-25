export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = (session.user as any)?.id;
    if (!userId) return NextResponse.json([], { status: 401 });

    const trees = await prisma.tree.findMany({
      where: { userId },
      orderBy: { plantedDate: 'desc' },
    });
    return NextResponse.json(trees ?? []);
  } catch (error: any) {
    console.error('Trees GET error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
