export const dynamic = "force-dynamic";




import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

interface SpeciesSelection {
  species: string;
  name: string;
  quantity: number;
}

interface CartItem {
  id: string;
  type: 'one-time' | 'subscription';
  treeId?: string;
  treeName?: string;
  treeImage?: string;
  planId?: string;
  planName?: string;
  treesPerMonth?: number;
  speciesSelection?: SpeciesSelection[];
  quantity: number;
  pricePerUnit: number;
  isGift: boolean;
  giftRecipient?: {
    name: string;
    email: string;
    message?: string;
  };
}

function generateGiftCode(): string {
  return `QUETZ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body as { items: CartItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || 'https://quetz.abacusai.app';
    const userId = session.user.id;

    // Separate by type
    const oneTimeItems = items.filter((item) => item.type === 'one-time');
    const subscriptionItems = items.filter((item) => item.type === 'subscription');
    const giftItems = items.filter((item) => item.isGift);

    // Validate gift recipients
    for (const item of giftItems) {
      if (!item.giftRecipient?.name || !item.giftRecipient?.email) {
        return NextResponse.json(
          { error: `Faltan datos del destinatario` },
          { status: 400 }
        );
      }
    }

    const pendingAdoptions: string[] = [];
    const pendingGifts: string[] = [];
    const pendingSubscriptions: string[] = [];
    const lineItems: any[] = [];

    // Process one-time items
    for (const item of oneTimeItems) {
      if (item.treeId) {
        const tree = await prisma.tree.findUnique({ where: { species: item.treeId } });
        if (!tree) continue;

        if (item.isGift) {
          const code = generateGiftCode();
          const gift = await prisma.gift.create({
            data: {
              code,
              planId: item.treeId,
              planName: item.treeName || '',
              treesPerMonth: item.quantity,
              durationMonths: 1,
              amountEur: item.pricePerUnit * item.quantity,
              senderUserId: userId,
              senderEmail: session.user.email || undefined,
              recipientName: item.giftRecipient!.name,
              recipientEmail: item.giftRecipient!.email,
              occasion: 'otro',
              message: item.giftRecipient?.message || null,
              status: 'pending',
            },
          });
          pendingGifts.push(gift.id);
        } else {
          const adoption = await prisma.adoption.create({
            data: {
              userId,
              treeId: tree.id,
              quantity: item.quantity,
              amount: item.pricePerUnit * item.quantity,
              currency: 'EUR',
              status: 'pending',
              progress: 0,
              incomeType: 'cart',
              socialFundPercentage: 0.3,
              socialFundAmount: item.pricePerUnit * item.quantity * 0.3,
            },
          });
          pendingAdoptions.push(adoption.id);
        }

        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.isGift ? `🎁 Regalo: ${item.treeName}` : `🌳 ${item.treeName}`,
              description: `${item.quantity} árbol(es) - Zacapa, Guatemala`,
            },
            unit_amount: Math.round(item.pricePerUnit * 100),
          },
          quantity: item.quantity,
        });
      }
    }

    // Process subscription items
    for (const item of subscriptionItems) {
      const speciesNames = (item.speciesSelection || []).map((s) => `${s.quantity}x ${s.name}`).join(', ');
      
      if (item.isGift) {
        const code = generateGiftCode();
        const gift = await prisma.gift.create({
          data: {
            code,
            planId: item.planId || '',
            planName: item.planName || '',
            treesPerMonth: item.treesPerMonth || 0,
            durationMonths: 12,
            amountEur: item.pricePerUnit * 12,
            senderUserId: userId,
            senderEmail: session.user.email || undefined,
            recipientName: item.giftRecipient!.name,
            recipientEmail: item.giftRecipient!.email,
            occasion: 'otro',
            message: item.giftRecipient?.message || null,
            status: 'pending',
          },
        });
        pendingGifts.push(gift.id);
      } else {
        const subscription = await prisma.subscription.create({
          data: {
            userId,
            planId: item.planId || 'cafe',
            planName: item.planName || 'Plan',
            treesPerMonth: item.treesPerMonth || 1,
            priceEurMonth: item.pricePerUnit,
            status: 'pending',
          },
        });
        pendingSubscriptions.push(subscription.id);
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.isGift 
              ? `🎁 Regalo: ${item.planName} (suscripción)`
              : `📅 ${item.planName}`,
            description: `${item.treesPerMonth} árbol(es)/mes${speciesNames ? ` - ${speciesNames}` : ''}`,
          },
          unit_amount: Math.round(item.pricePerUnit * 100),
          recurring: item.isGift ? undefined : { interval: 'month' as const },
        },
        quantity: 1,
      });
    }

    // Determine checkout mode
    const hasSubscriptions = subscriptionItems.filter((i) => !i.isGift).length > 0;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: hasSubscriptions ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${origin}/mi-bosque?cart=success`,
      cancel_url: `${origin}/carrito?cancelled=true`,
      metadata: {
        type: 'cart',
        userId,
        adoptionIds: pendingAdoptions.join(','),
        giftIds: pendingGifts.join(','),
        subscriptionIds: pendingSubscriptions.join(','),
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Cart checkout error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el carrito' },
      { status: 500 }
    );
  }
}
