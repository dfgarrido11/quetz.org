export const dynamic = "force-dynamic";



import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const ADMIN_EMAILS = ['admin@quetz.com', 'john@doe.com', 'dgarrido@quetz.org', 'dfgarrido11@gmail.com'];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    // Verify admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!ADMIN_EMAILS.includes(session.user.email) && user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    // Get base stats
    const baseStats = await prisma.stats.findUnique({ where: { id: 'main' } });
    const school = await prisma.schoolProject.findUnique({ where: { id: 'zacapa' } });

    // Count adoptions by status
    const pendingAdoptions = await prisma.adoption.count({ where: { status: 'pending' } });
    const activeSubscriptions = await prisma.adoption.count({ 
      where: { subscriptionStatus: 'active' } 
    });

    // Count users
    const totalUsers = await prisma.user.count();

    // Corporate leads
    const corporateLeads = await prisma.corporateLead.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    // Recent adoptions
    const recentAdoptions = await prisma.adoption.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        tree: { select: { nameEs: true } },
      },
    });

    // Aggregate dynamic data
    const adoptionAggregates = await prisma.adoption.aggregate({
      _sum: { amount: true, quantity: true, socialFundAmount: true },
      where: { status: { in: ['paid', 'active', 'completed'] } },
    });

    const donationAggregates = await prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: { in: ['paid', 'completed'] } },
    });

    // Calculate totals
    const dynamicIncome = (adoptionAggregates._sum.amount || 0) + (donationAggregates._sum.amount || 0);
    const totalIncome = (baseStats?.totalIncome || 0) + dynamicIncome;
    const socialFund = (baseStats?.socialFund || 0) + (adoptionAggregates._sum.socialFundAmount || 0) + (donationAggregates._sum.amount || 0) * 0.3;

    const stats = {
      totalIncome,
      socialFund,
      treesAdopted: (baseStats?.treesAdopted || 0) + (adoptionAggregates._sum.quantity || 0),
      treesPlanted: baseStats?.treesPlanted || 0,
      familiesHelped: baseStats?.familiesHelped || 0,
      co2CapturedKg: baseStats?.co2CapturedKg || 0,
      schoolFunding: school?.raisedEur || 0,
      schoolProgress: school ? (school.raisedEur / school.goalEur) * 100 : 0,
      pendingAdoptions,
      activeSubscriptions,
      totalUsers,
      corporateLeads: corporateLeads.map(l => ({
        id: l.id,
        companyName: l.companyName,
        country: l.country,
        contactName: l.contactName,
        contactEmail: l.contactEmail,
        contactPhone: l.contactPhone,
        employeeCount: l.employeeCount,
        status: l.status,
        message: l.message,
        createdAt: l.createdAt.toISOString(),
      })),
      recentAdoptions: recentAdoptions.map(a => ({
        id: a.id,
        userName: a.user?.name || a.user?.email?.split('@')[0] || 'Anónimo',
        treeName: a.tree?.nameEs || 'Árbol',
        quantity: a.quantity,
        amount: a.amount,
        currency: a.currency,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
