export const dynamic = "force-dynamic";



import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          await handleSubscriptionCheckout(session);
        } else if (session.payment_status === 'paid') {
          const type = session.metadata?.type;
          if (type === 'cart') {
            await handleCartPayment(session);
          } else {
            await handleSuccessfulPayment(session);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case 'payment_intent.succeeded': {
        console.log('Payment intent succeeded:', event.data.object.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Handle subscription checkout completion
async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata?.subscriptionId) {
    console.error('No subscriptionId in checkout session metadata');
    return;
  }

  const stripeSubscriptionId = session.subscription as string;

  // Update our subscription record with Stripe subscription ID
  await prisma.subscription.update({
    where: { id: metadata.subscriptionId },
    data: {
      stripeSubscriptionId,
      status: 'active',
    },
  });

  console.log(`Subscription ${metadata.subscriptionId} activated with Stripe ID: ${stripeSubscriptionId}`);
}

// Handle monthly invoice payment (recurring)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const stripeSubscriptionId = invoiceAny.subscription as string;
  if (!stripeSubscriptionId) return;

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!subscription) {
    console.log('Subscription not found for invoice:', stripeSubscriptionId);
    return;
  }

  const amountPaid = (invoice.amount_paid || 0) / 100; // Convert from cents

  // Update subscription totals and period
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      totalAmountPaid: { increment: amountPaid },
      totalTreesDelivered: { increment: subscription.treesPerMonth },
      currentPeriodStart: invoiceAny.period_start ? new Date(invoiceAny.period_start * 1000) : undefined,
      currentPeriodEnd: invoiceAny.period_end ? new Date(invoiceAny.period_end * 1000) : undefined,
      status: 'active',
    },
  });

  // Create adoption record for this month's trees
  const tree = await prisma.tree.findFirst({ where: { active: true } });
  if (tree) {
    await prisma.adoption.create({
      data: {
        userId: subscription.userId,
        treeId: tree.id,
        quantity: subscription.treesPerMonth,
        amount: subscription.priceEurMonth,
        currency: 'EUR',
        status: 'paid',
        incomeType: 'subscription',
        socialFundPercentage: 0.3,
        socialFundAmount: subscription.priceEurMonth * 0.3,
        progress: 10,
      },
    });
  }

  // Update global stats
  await updateStats(subscription.priceEurMonth, subscription.treesPerMonth, 25);

  console.log(`Invoice paid for subscription ${subscription.id}. Trees delivered: ${subscription.treesPerMonth}`);
}

// Handle subscription status updates
async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subAny = stripeSubscription as any;
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) return;

  let status = 'active';
  if (stripeSubscription.status === 'past_due') status = 'paused';
  else if (stripeSubscription.status === 'canceled') status = 'cancelled';
  else if (stripeSubscription.status === 'unpaid') status = 'paused';

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodStart: subAny.current_period_start ? new Date(subAny.current_period_start * 1000) : undefined,
      currentPeriodEnd: subAny.current_period_end ? new Date(subAny.current_period_end * 1000) : undefined,
    },
  });

  console.log(`Subscription ${subscription.id} updated to status: ${status}`);
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(stripeSubscription: Stripe.Subscription) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
  });

  console.log(`Subscription ${subscription.id} cancelled`);
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  
  if (!metadata) {
    console.error('No metadata in checkout session');
    return;
  }

  const { type, adoptionId, donationId, userId } = metadata;

  try {
    if (type === 'adoption' && adoptionId) {
      // Update adoption status to paid
      const adoption = await prisma.adoption.update({
        where: { id: adoptionId },
        data: {
          status: 'paid',
          progress: 10, // Initial progress after payment
        },
        include: { tree: true },
      });

      // Assign a farmer (round-robin)
      const activeFarmers = await prisma.farmer.findMany({
        where: { active: true },
        orderBy: { id: 'asc' },
      });

      if (activeFarmers.length > 0) {
        // Count adoptions per farmer to find the one with least
        const farmerAdoptionCounts = await prisma.adoption.groupBy({
          by: ['farmerId'],
          where: { farmerId: { not: null }, status: { in: ['paid', 'active', 'completed'] } },
          _count: true,
        });

        const countMap = new Map(farmerAdoptionCounts.map(f => [f.farmerId, f._count]));
        
        // Find farmer with least adoptions
        let selectedFarmer = activeFarmers[0];
        let minCount = countMap.get(selectedFarmer.id) || 0;

        for (const farmer of activeFarmers) {
          const count = countMap.get(farmer.id) || 0;
          if (count < minCount) {
            minCount = count;
            selectedFarmer = farmer;
          }
        }

        await prisma.adoption.update({
          where: { id: adoptionId },
          data: { farmerId: selectedFarmer.id },
        });
      }

      // Update global stats
      await updateStats(adoption.amount, adoption.quantity, adoption.tree?.impactCo2Kg || 25);

      console.log(`Adoption ${adoptionId} marked as paid. Amount: €${adoption.amount}`);

    } else if (type === 'donation' && donationId) {
      // Update donation status to completed
      const donation = await prisma.donation.update({
        where: { id: donationId },
        data: { status: 'completed' },
      });

      // Update school project funding
      if (donation.purpose === 'school') {
        await prisma.schoolProject.update({
          where: { id: 'escuela-zacapa' },
          data: {
            raisedEur: { increment: donation.amount },
            history: {
              push: {
                date: new Date().toISOString(),
                amount: donation.amount,
                description: 'Donación recibida',
              },
            },
          },
        });
      }

      // Update global stats for donation
      await updateStatsForDonation(donation.amount);

      console.log(`Donation ${donationId} completed. Amount: €${donation.amount}`);
    }

  } catch (error) {
    console.error('Error processing payment:', error);
    throw error; // Re-throw to return 500 to Stripe (will retry)
  }
}

async function updateStats(amountEur: number, treeQuantity: number, co2PerTree: number) {
  const socialFundAmount = amountEur * 0.3;

  await prisma.stats.upsert({
    where: { id: 'main' },
    create: {
      id: 'main',
      totalIncome: amountEur,
      socialFund: socialFundAmount,
      treesAdopted: treeQuantity,
      treesPlanted: 0, // Will be updated when actually planted
      familiesHelped: 1,
      co2CapturedKg: treeQuantity * co2PerTree,
      schoolFunding: 0,
    },
    update: {
      totalIncome: { increment: amountEur },
      socialFund: { increment: socialFundAmount },
      treesAdopted: { increment: treeQuantity },
      co2CapturedKg: { increment: treeQuantity * co2PerTree },
    },
  });
}

async function updateStatsForDonation(amountEur: number) {
  const socialFundAmount = amountEur * 0.3;

  await prisma.stats.upsert({
    where: { id: 'main' },
    create: {
      id: 'main',
      totalIncome: amountEur,
      socialFund: socialFundAmount,
      treesAdopted: 0,
      treesPlanted: 0,
      familiesHelped: 0,
      co2CapturedKg: 0,
      schoolFunding: amountEur,
    },
    update: {
      totalIncome: { increment: amountEur },
      socialFund: { increment: socialFundAmount },
      schoolFunding: { increment: amountEur },
    },
  });
}

// Handle cart payment completion
async function handleCartPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) return;

  const adoptionIds = metadata.adoptionIds?.split(',').filter(Boolean) || [];
  const giftIds = metadata.giftIds?.split(',').filter(Boolean) || [];

  // Update adoptions to paid
  for (const id of adoptionIds) {
    const adoption = await prisma.adoption.update({
      where: { id },
      data: { status: 'paid', progress: 10 },
      include: { tree: true },
    });
    await updateStats(adoption.amount, adoption.quantity, adoption.tree?.impactCo2Kg || 25);
  }

  // Update gifts to sent
  for (const id of giftIds) {
    await prisma.gift.update({
      where: { id },
      data: { status: 'sent', sentAt: new Date() },
    });
  }

  console.log(`Cart payment processed: ${adoptionIds.length} adoptions, ${giftIds.length} gifts`);
}
