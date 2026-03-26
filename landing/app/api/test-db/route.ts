import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Intenta contar los usuarios (la tabla existe aunque esté vacía)
    const count = await prisma.quetz_users.count();
    return NextResponse.json({ 
      success: true, 
      message: 'Conexión a la base de datos exitosa',
      usersCount: count 
    });
  } catch (error: any) {
    console.error('Error de base de datos:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      hint: 'Asegúrate de que las tablas estén creadas con el SQL que te di'
    }, { status: 500 });
  }
}
