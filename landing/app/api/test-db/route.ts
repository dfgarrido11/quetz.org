import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Importar Prisma dinámicamente solo cuando se ejecute la función
  const { prisma } = await import('@/lib/prisma');
  
  try {
    const count = await prisma.quetz_users.count();
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('Error en /api/test-db:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

