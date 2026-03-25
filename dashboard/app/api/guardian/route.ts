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
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const assignment = await prisma.userGuardianAssignment.findUnique({
      where: { userId },
      include: {
        guardian: {
          include: { updates: { orderBy: { createdAt: 'desc' }, take: 10 } },
        },
      },
    });
    if (!assignment) return NextResponse.json({ error: 'Sin guardia asignado' }, { status: 404 });
    return NextResponse.json(assignment.guardian);
  } catch (error: any) {
    console.error('Guardian GET error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
