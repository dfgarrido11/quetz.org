import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return mock metrics for now until B2B database tables are set up in production
    const mockMetrics = {
      // Lead Generation
      leadsGenerated: 15,
      leadsEnriched: 12,
      leadsQualified: 8,

      // Email Performance
      emailsSent: 45,
      emailsDelivered: 42,
      emailsOpened: 18,
      emailsClicked: 6,
      emailsReplied: 3,

      // Conversion Funnel
      meetingsBooked: 1,
      proposalsSent: 1,
      dealsCreated: 0,
      dealsClosed: 0,
      revenue: 0,

      // Efficiency Metrics
      responseRate: 7.1,
      conversionRate: 0,
      averageScore: 78.5,

      // Sequence Performance
      sequences: {
        'de-outreach': {
          name: 'Outreach Alemán',
          totalLeads: 25,
          openRate: 42.0,
          clickRate: 14.0,
          replyRate: 7.1,
        },
        'es-outreach': {
          name: 'Outreach Español',
          totalLeads: 15,
          openRate: 35.0,
          clickRate: 12.0,
          replyRate: 5.0,
        },
        'en-outreach': {
          name: 'Outreach Inglés',
          totalLeads: 20,
          openRate: 40.0,
          clickRate: 15.0,
          replyRate: 8.0,
        }
      },

      // Recent Activity
      recentLeads: [
        {
          id: 'lead_001',
          company: 'GreenTech Solutions GmbH',
          score: 85,
          source: 'manus_pro',
          status: 'qualified',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'lead_002',
          company: 'Sustainable Innovations AG',
          score: 72,
          source: 'cold_email',
          status: 'contacted',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],

      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(mockMetrics);

  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}