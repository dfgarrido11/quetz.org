import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'dfgarrido11@gmail.com'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Ensure csr_leads raw table exists
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS csr_leads (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255),
        contact_name VARCHAR(255),
        contact_email VARCHAR(255),
        employees INTEGER,
        country VARCHAR(100),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    const [stats, schoolProject, corporateLeads, recentAdoptions, totalUsers, activeSubscriptions, pendingAdoptions] =
      await Promise.all([
        prisma.stats.findUnique({ where: { id: 'main' } }),
        prisma.schoolProject.findUnique({ where: { id: 'zacapa' } }),
        prisma.corporateLead.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.adoption.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: { select: { name: true, email: true } },
            tree: { select: { nameEs: true } },
          },
        }),
        prisma.user.count(),
        prisma.subscription.count({ where: { status: 'active' } }),
        prisma.adoption.count({ where: { status: 'pending' } }),
      ])

    const schoolGoal = schoolProject?.goalEur ?? 50000
    const schoolRaised = schoolProject?.raisedEur ?? stats?.schoolFunding ?? 0
    const schoolProgressPct = schoolGoal > 0 ? (schoolRaised / schoolGoal) * 100 : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalIncome: stats?.totalIncome ?? 0,
        socialFund: stats?.socialFund ?? 0,
        treesAdopted: stats?.treesAdopted ?? 0,
        treesPlanted: stats?.treesPlanted ?? 0,
        familiesHelped: stats?.familiesHelped ?? 0,
        co2CapturedKg: stats?.co2CapturedKg ?? 0,
        schoolFunding: schoolRaised,
        schoolProgress: schoolProgressPct,
        pendingAdoptions,
        activeSubscriptions,
        totalUsers,
        corporateLeads: corporateLeads.map((l) => ({
          id: l.id,
          companyName: l.companyName,
          country: l.country,
          contactName: l.contactName,
          contactEmail: l.contactEmail,
          contactPhone: l.contactPhone ?? null,
          employeeCount: l.employeeCount ?? null,
          status: l.status,
          message: l.message ?? null,
          createdAt: l.createdAt.toISOString(),
        })),
        recentAdoptions: recentAdoptions.map((a) => ({
          id: a.id,
          userName: a.user?.name ?? a.user?.email ?? 'Anónimo',
          treeName: a.tree?.nameEs ?? 'Árbol',
          quantity: a.quantity,
          amount: a.amount,
          currency: a.currency,
          status: a.status,
          createdAt: a.createdAt.toISOString(),
        })),
      },
    })
  } catch (error: any) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
