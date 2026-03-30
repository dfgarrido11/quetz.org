export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAIL = 'dfgarrido11@gmail.com'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ isAdmin: false }, { status: 401 })
  }

  const isAdmin = session.user.email === ADMIN_EMAIL

  return NextResponse.json({ isAdmin })
}