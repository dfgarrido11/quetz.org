export const dynamic = "force-dynamic";

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// List of admin emails
const ADMIN_EMAILS = [
  'admin@quetz.com',
  'john@doe.com', // For testing
  'dgarrido@quetz.org',
  'dfgarrido11@gmail.com',
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Check if email is in admin list or user has admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    const isAdmin = ADMIN_EMAILS.includes(session.user.email) || user?.role === 'admin';

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
