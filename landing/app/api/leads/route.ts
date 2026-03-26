export const dynamic = "force-dynamic";

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, pais } = body ?? {};

    if (!nombre || !email || !pais) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        nombre: nombre ?? '',
        email: email ?? '',
        pais: pais ?? '',
      },
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Error al guardar los datos' },
      { status: 500 }
    );
  }
}
