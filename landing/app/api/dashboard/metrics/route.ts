import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    // Lead Generation Metrics
    const [
      leadsGeneratedToday,
      leadsEnrichedToday,
      leadsQualifiedToday,
      totalAutomatedLeads,
    ] = await Promise.all([
      prisma.automatedLead.count({
        where: { createdAt: { gte: todayStart } }
      }),
      prisma.automatedLead.count({
        where: {
          enrichedAt: { gte: todayStart }
        }
      }),
      prisma.automatedLead.count({
        where: {
          createdAt: { gte: todayStart },
          score: { gte: 70 }
        }
      }),
      prisma.automatedLead.count()
    ]);

    // Email Performance Metrics
    const [
      emailsSentToday,
      emailsDeliveredToday,
      emailsOpenedToday,
      emailsClickedToday,
      emailsRepliedToday,
    ] = await Promise.all([
      prisma.outreachLead.count({
        where: { sentAt: { gte: todayStart } }
      }),
      prisma.outreachLead.count({
        where: { deliveredAt: { gte: todayStart } }
      }),
      prisma.outreachLead.count({
        where: { openedAt: { gte: todayStart } }
      }),
      prisma.outreachLead.count({
        where: { clickedAt: { gte: todayStart } }
      }),
      prisma.outreachLead.count({
        where: { repliedAt: { gte: todayStart } }
      }),
    ]);

    // Conversion Metrics (simulated for now)
    const meetingsBooked = Math.floor(emailsRepliedToday * 0.3);
    const proposalsSent = Math.floor(meetingsBooked * 0.8);
    const dealsCreated = Math.floor(proposalsSent * 0.6);
    const dealsClosed = Math.floor(dealsCreated * 0.4);
    const revenue = dealsClosed * 1250; // Average deal size €1,250

    // Efficiency Metrics
    const responseRate = emailsDeliveredToday > 0
      ? (emailsRepliedToday / emailsDeliveredToday * 100)
      : 0;

    const conversionRate = leadsGeneratedToday > 0
      ? (dealsClosed / leadsGeneratedToday * 100)
      : 0;

    const averageScore = await prisma.automatedLead.aggregate({
      _avg: { score: true },
      where: { createdAt: { gte: todayStart } }
    });

    // Sequence Performance
    const sequencePerformance = await getSequencePerformance();

    // Recent Activity
    const recentLeads = await prisma.automatedLead.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        company: true,
        score: true,
        source: true,
        status: true,
        createdAt: true,
      }
    });

    const metrics = {
      // Lead Generation
      leadsGenerated: leadsGeneratedToday,
      leadsEnriched: leadsEnrichedToday,
      leadsQualified: leadsQualifiedToday,

      // Email Performance
      emailsSent: emailsSentToday,
      emailsDelivered: emailsDeliveredToday,
      emailsOpened: emailsOpenedToday,
      emailsClicked: emailsClickedToday,
      emailsReplied: emailsRepliedToday,

      // Conversion Funnel
      meetingsBooked,
      proposalsSent,
      dealsCreated,
      dealsClosed,
      revenue,

      // Efficiency Metrics
      responseRate: Number(responseRate.toFixed(1)),
      conversionRate: Number(conversionRate.toFixed(1)),
      averageScore: Number((averageScore._avg.score || 0).toFixed(1)),

      // Sequence Performance
      sequences: sequencePerformance,

      // Recent Activity
      recentLeads,

      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

async function getSequencePerformance() {
  try {
    // Get performance for each sequence
    const sequences = ['es-outreach', 'de-outreach', 'en-outreach'];
    const performance: Record<string, any> = {};

    for (const sequenceId of sequences) {
      const leads = await prisma.outreachLead.findMany({
        where: { sequenceId },
        select: {
          status: true,
          sentAt: true,
          openedAt: true,
          clickedAt: true,
          repliedAt: true,
        }
      });

      const total = leads.length;
      const sent = leads.filter(l => l.sentAt).length;
      const opened = leads.filter(l => l.openedAt).length;
      const clicked = leads.filter(l => l.clickedAt).length;
      const replied = leads.filter(l => l.repliedAt).length;

      const sequenceNames: Record<string, string> = {
        'es-outreach': 'Outreach Español',
        'de-outreach': 'Outreach Alemán',
        'en-outreach': 'Outreach Inglés',
      };

      performance[sequenceId] = {
        name: sequenceNames[sequenceId] || sequenceId,
        totalLeads: total,
        openRate: sent > 0 ? Number((opened / sent * 100).toFixed(1)) : 0,
        clickRate: sent > 0 ? Number((clicked / sent * 100).toFixed(1)) : 0,
        replyRate: sent > 0 ? Number((replied / sent * 100).toFixed(1)) : 0,
      };
    }

    return performance;

  } catch (error) {
    console.error('Sequence performance error:', error);
    return {};
  }
}