export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adoption = await prisma.adoption.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        status: { in: ['paid', 'active'] },
      },
      include: {
        tree: true,
        farmer: true,
        user: { select: { name: true } },
      },
    });

    if (!adoption) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: adoption.id,
      userName: adoption.user?.name || 'Amigo del bosque',
      treeName: adoption.tree?.nameEs || 'Árbol',
      treeSpecies: adoption.tree?.species || '',
      treeImage: adoption.tree?.image || '/trees/cafe.jpg',
      farmerName: adoption.farmer?.name || null,
      farmerLocation: adoption.farmer?.location || null,
      adoptedAt: adoption.createdAt.toISOString(),
      quantity: adoption.quantity,
      co2PerYear: adoption.tree?.impactCo2Kg || 25,
      impactFamilies: adoption.tree?.impactFamilies || 0.1,
    });
  } catch (err: any) {
    console.error('[certificado GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
