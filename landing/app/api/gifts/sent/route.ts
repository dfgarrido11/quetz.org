export const dynamic = "force-dynamic";




import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ gifts: [] });
    }

    const gifts = await prisma.gift.findMany({
      where: { senderUserId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        planName: true,
        recipientName: true,
        recipientEmail: true,
        status: true,
        sentAt: true,
        activatedAt: true,
        message: true,
      },
    });

    return NextResponse.json({ gifts });
  } catch (error) {
    console.error('Error fetching sent gifts:', error);
    return NextResponse.json({ gifts: [] });
  }
}
