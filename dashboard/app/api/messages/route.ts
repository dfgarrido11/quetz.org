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

    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages ?? []);
  } catch (error: any) {
    console.error('Messages GET error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = (session.user as any)?.id;
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });

    // Find guardian proxy user
    let guardianProxy = await prisma.user.findFirst({ where: { email: 'guardian-system@quetz.org' } });
    if (!guardianProxy) {
      return NextResponse.json({ error: 'Sistema no disponible' }, { status: 500 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId: guardianProxy.id,
        content: content.trim(),
        isFromGuardian: false,
      },
    });
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 });
  }
}
