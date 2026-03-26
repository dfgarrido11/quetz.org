export const dynamic = "force-dynamic";




import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, language, source } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.lead.findFirst({
      where: { email },
    });

    if (existing) {
      // Update existing
      await prisma.lead.update({
        where: { id: existing.id },
        data: { 
          pais: language || 'de',
          nombre: source || 'newsletter',
        },
      });
    } else {
      // Create new
      await prisma.lead.create({
        data: {
          email,
          nombre: source || 'newsletter',
          pais: language || 'de',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
