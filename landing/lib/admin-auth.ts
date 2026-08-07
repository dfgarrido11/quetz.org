import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Resolves the current session to an admin user, or null.
 * Every /api/admin/* route must gate on this.
 */
export async function requireAdmin(): Promise<{ role: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  return user?.role === 'admin' ? user : null;
}

export const FORBIDDEN = () => NextResponse.json({ error: 'Forbidden' }, { status: 403 });

/** Parses a JSON body, returning null on malformed input rather than throwing. */
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Trims a string field down to `null` when absent or blank. */
export function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}
