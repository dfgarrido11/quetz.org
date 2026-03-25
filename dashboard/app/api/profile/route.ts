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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, profilePhoto: true, subscriptionStart: true, subscriptionTier: true },
    });
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const { name, email } = await request.json();
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { ...(name !== undefined && { name }), ...(email !== undefined && { email }) },
      select: { id: true, email: true, name: true, profilePhoto: true, subscriptionStart: true, subscriptionTier: true },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
  }
}
