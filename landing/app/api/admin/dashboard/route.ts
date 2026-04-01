export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'dfgarrido11@gmail.com'

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [
      giftRevAgg,
      adoptionRevAgg,
      donationRevAgg,
      mrrAgg,
      treesAdoptedCount,
      treesFromGiftsCount,
      giftFunnel,
      totalUsers,
      pendingAdoptions,
      activeSubscriptions,
      corporateLeadsCount,
      newsletterLeadsCount,
      recentGifts,
      recentAdoptions,
      corporateLeads,
    ] = await Promise.all([
      // Gift revenue (paid, sent, or activated)
      safeQuery(
        () => prisma.gift.aggregate({
          _sum: { amountEur: true },
          where: { status: { in: ['paid', 'sent', 'activated'] } },
        }),
        { _sum: { amountEur: 0 } }
      ),

      // Adoption revenue
      safeQuery(
        () => prisma.adoption.aggregate({ _sum: { amount: true } }),
        { _sum: { amount: 0 } }
      ),

      // Donation revenue
      safeQuery(
        () => prisma.donation.aggregate({ _sum: { amount: true } }),
        { _sum: { amount: 0 } }
      ),

      // MRR — sum of active subscription monthly prices
      safeQuery(
        () => prisma.subscription.aggregate({
          _sum: { priceEurMonth: true },
          where: { status: 'active' },
        }),
        { _sum: { priceEurMonth: 0 } }
      ),

      // Trees from adoptions
      safeQuery(() => prisma.adoption.count(), 0),

      // Trees from gifts (paid, sent, or activated)
      safeQuery(
        () => prisma.gift.count({ where: { status: { in: ['paid', 'sent', 'activated'] } } }),
        0
      ),

      // Gift funnel counts
      safeQuery(
        () => prisma.gift.groupBy({ by: ['status'], _count: { id: true } }),
        []
      ),

      safeQuery(() => prisma.user.count(), 0),
      safeQuery(() => prisma.adoption.count({ where: { status: 'pending' } }), 0),
      safeQuery(() => prisma.subscription.count({ where: { status: 'active' } }), 0),
      safeQuery(() => prisma.corporateLead.count(), 0),
      safeQuery(() => prisma.lead.count(), 0),

      // Recent gifts
      safeQuery(
        () => prisma.gift.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true, code: true, planName: true, amountEur: true,
            senderEmail: true, recipientEmail: true, recipientName: true,
            status: true, createdAt: true,
          },
        }),
        []
      ),

      // Recent adoptions
      safeQuery(
        () => prisma.adoption.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: { select: { name: true, email: true } },
            tree: { select: { nameEs: true } },
          },
        }),
        []
      ),

      // Corporate leads list
      safeQuery(
        () => prisma.corporateLead.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
        []
      ),
    ])

    // ── Revenue calculations ────────────────────────────────────────────────
    const giftRevenue     = giftRevAgg._sum.amountEur ?? 0
    const adoptionRevenue = adoptionRevAgg._sum.amount ?? 0
    const donationRevenue = donationRevAgg._sum.amount ?? 0
    const mrr             = mrrAgg._sum.priceEurMonth ?? 0
    const totalRevenue    = giftRevenue + adoptionRevenue + donationRevenue
    const socialFund      = totalRevenue * 0.30
    const schoolRaised    = socialFund
    const schoolGoal      = 50000
    const schoolProgress  = schoolGoal > 0 ? Math.min((schoolRaised / schoolGoal) * 100, 100) : 0

    // ── Tree / impact calculations ──────────────────────────────────────────
    const totalTrees    = treesAdoptedCount + treesFromGiftsCount
    const totalFamilies = Math.ceil(totalTrees / 10)
    const co2Captured   = totalTrees * 22

    // ── Gift funnel ─────────────────────────────────────────────────────────
    const funnelMap = Object.fromEntries(
      (giftFunnel as { status: string; _count: { id: number } }[])
        .map(g => [g.status, g._count.id])
    )
    const giftsPending   = funnelMap['pending']   ?? 0
    const giftsPaid      = funnelMap['paid']       ?? 0
    const giftsSent      = funnelMap['sent']       ?? 0
    const giftsActivated = funnelMap['activated']  ?? 0

    // ── Merge recent activity ───────────────────────────────────────────────
    const recentActivity = [
      ...(recentGifts as any[]).map(g => ({
        id: g.id,
        type: 'gift' as const,
        description: `${g.senderEmail} → ${g.recipientName}`,
        planName: g.planName,
        amount: g.amountEur,
        currency: 'EUR',
        status: g.status,
        code: g.code,
        createdAt: g.createdAt.toISOString(),
      })),
      ...(recentAdoptions as any[]).map(a => ({
        id: a.id,
        type: 'adoption' as const,
        description: a.user?.name ?? a.user?.email ?? 'Anónimo',
        planName: a.tree?.nameEs ?? 'Árbol',
        amount: a.amount,
        currency: a.currency,
        status: a.status,
        code: null,
        createdAt: a.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      stats: {
        // Revenue
        totalRevenue,
        giftRevenue,
        adoptionRevenue,
        donationRevenue,
        mrr,
        socialFund,

        // School
        schoolRaised,
        schoolGoal,
        schoolProgress,

        // Trees & impact
        treesAdopted: treesAdoptedCount,
        treesFromGifts: treesFromGiftsCount,
        totalTrees,
        totalFamilies,
        co2Captured,

        // Gift funnel
        giftsPending,
        giftsPaid,
        giftsSent,
        giftsActivated,
        giftsTotal: giftsPending + giftsPaid + giftsSent + giftsActivated,

        // Pipeline
        totalUsers,
        corporateLeads: corporateLeadsCount,
        newsletterLeads: newsletterLeadsCount,

        // Operational
        pendingAdoptions,
        activeSubscriptions,

        // Recent activity feed
        recentActivity,

        // Corporate leads table
        corporateLeadsList: (corporateLeads as any[]).map(l => ({
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
      },
    })
  } catch (error: any) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
