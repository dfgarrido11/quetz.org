export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, calculatePrice } from '@/lib/stripe';
import prisma from '@/lib/prisma';

// Monthly subscription plans
const PLANS = {
  cafe: {
    name: 'Plan Café',
    treesPerMonth: 1,
    priceEurMonth: 5,
    description: '1 árbol/mes - Café, cacao o frutal',
  },
  bosquePequeno: {
    name: 'Bosque Pequeño',
    treesPerMonth: 3,
    priceEurMonth: 12,
    description: '3 árboles/mes - Mix de especies',
  },
  bosqueGrande: {
    name: 'Bosque Grande',
    treesPerMonth: 10,
    priceEurMonth: 35,
    description: '10 árboles/mes - Reforestación intensiva',
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, country = 'ES' } = body;

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || 'https://quetz.abacusai.app';
    const { amount, currency } = calculatePrice(plan.priceEurMonth, country);

    // Get or create Stripe customer
    let stripeCustomerId: string;
    
    const existingSub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, stripeCustomerId: { not: null } },
    });

    if (existingSub?.stripeCustomerId) {
      stripeCustomerId = existingSub.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Create a price for this subscription
    const price = await stripe.prices.create({
      currency: currency,
      unit_amount: Math.round(amount * 100),
      recurring: { interval: 'month' },
      product_data: {
        name: `QUETZ - ${plan.name}`,
        metadata: {
          planId,
          treesPerMonth: String(plan.treesPerMonth),
        },
      },
    });

    // Create pending subscription record
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId,
        planName: plan.name,
        treesPerMonth: plan.treesPerMonth,
        priceEurMonth: plan.priceEurMonth,
        stripeCustomerId,
        stripePriceId: price.id,
        status: 'pending',
      },
    });

    // Create Stripe Checkout Session for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: `${origin}/mi-bosque?subscription=success&plan=${planId}`,
      cancel_url: `${origin}/?subscription=cancelled`,
      metadata: {
        type: 'subscription',
        subscriptionId: subscription.id,
        userId: session.user.id,
        planId,
      },
      subscription_data: {
        metadata: {
          subscriptionId: subscription.id,
          userId: session.user.id,
          planId,
          treesPerMonth: String(plan.treesPerMonth),
        },
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      subscriptionId: subscription.id,
    });

  } catch (error) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: 'Error al crear la suscripción' },
      { status: 500 }
    );
  }
}

// GET - List available plans
export async function GET() {
  return NextResponse.json({ plans: PLANS });
}
