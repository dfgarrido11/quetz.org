export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

interface MrrResponse {
  mrr: number;           // Monthly Recurring Revenue in EUR
  totalRevenue: number;  // All-time charges in EUR
  activeSubscribers: number;
  oneTimeRevenue: number;
  currency: string;
  lastUpdated: string;
}

interface ErrorResponse {
  error: string;
  mrr: 0;
  totalRevenue: 0;
  activeSubscribers: 0;
  oneTimeRevenue: 0;
}

/**
 * GET /api/stripe/mrr
 *
 * Fetches real revenue data directly from Stripe:
 * - MRR: sum of all active subscription amounts (converted to EUR)
 * - Total revenue: all successful charges ever
 * - Active subscribers count
 *
 * Cached at the edge for 5 minutes to avoid rate limits.
 */
export async function GET(): Promise<NextResponse<MrrResponse | ErrorResponse>> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY not configured', mrr: 0, totalRevenue: 0, activeSubscribers: 0, oneTimeRevenue: 0 },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  // EUR conversion rates (approximate, good enough for dashboard display)
  const TO_EUR: Record<string, number> = {
    eur: 1,
    usd: 0.92,
    gbp: 1.17,
    chf: 1.05,
    mxn: 0.054,
    brl: 0.18,
    gtq: 0.12,
  };

  function toEur(amount: number, currency: string): number {
    const rate = TO_EUR[currency.toLowerCase()] ?? 1;
    return Math.round(amount * rate) / 100; // Stripe amounts are in cents
  }

  try {
    // ── 1. MRR: iterate active subscriptions ─────────────────────────────────
    let mrr = 0;
    let activeSubscribers = 0;

    for await (const sub of stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.items.data.price'],
    })) {
      activeSubscribers++;
      for (const item of sub.items.data) {
        const price = item.price;
        const amount = price.unit_amount ?? 0;
        const currency = price.currency;
        const interval = price.recurring?.interval;
        const intervalCount = price.recurring?.interval_count ?? 1;

        // Normalize to monthly
        const amountEur = toEur(amount * (item.quantity ?? 1), currency);
        if (interval === 'month') {
          mrr += amountEur / intervalCount;
        } else if (interval === 'year') {
          mrr += amountEur / (12 * intervalCount);
        } else if (interval === 'week') {
          mrr += (amountEur * 52) / 12;
        }
      }
    }

    // ── 2. Total revenue: all successful charges (all time) ───────────────────
    let totalRevenue = 0;
    let oneTimeRevenue = 0;

    for await (const charge of stripe.charges.list({ limit: 100 })) {
      if (!charge.paid || charge.refunded) continue;
      const amountEur = toEur(charge.amount, charge.currency);
      totalRevenue += amountEur;
      // One-time = no associated subscription invoice
      if (!charge.invoice) {
        oneTimeRevenue += amountEur;
      }
    }

    // Round to 2 decimal places
    const round2 = (n: number) => Math.round(n * 100) / 100;

    return NextResponse.json(
      {
        mrr: round2(mrr),
        totalRevenue: round2(totalRevenue),
        activeSubscribers,
        oneTimeRevenue: round2(oneTimeRevenue),
        currency: 'EUR',
        lastUpdated: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Stripe error';
    console.error('[stripe/mrr]', message);
    return NextResponse.json(
      { error: message, mrr: 0, totalRevenue: 0, activeSubscribers: 0, oneTimeRevenue: 0 },
      { status: 500 }
    );
  }
}
