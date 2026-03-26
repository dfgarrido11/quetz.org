export const dynamic = "force-dynamic";




import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, calculatePrice } from '@/lib/stripe';
import prisma from '@/lib/prisma';

const BASE_TREE_PRICE_EUR = 25;
const SCHOOL_DONATION_OPTIONS = [10, 25, 50, 100];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, treeId, quantity, country = 'ES', customAmount } = body;
    
    const origin = request.headers.get('origin') || 'https://quetz.abacusai.app';
    
    if (type === 'adoption') {
      // Tree adoption checkout
      if (!treeId || !quantity) {
        return NextResponse.json({ error: 'Faltan datos de adopción' }, { status: 400 });
      }

      // treeId from frontend is actually the species (cafe, aguacate, etc.)
      const tree = await prisma.tree.findUnique({ where: { species: treeId } });
      if (!tree) {
        return NextResponse.json({ error: 'Árbol no encontrado' }, { status: 404 });
      }

      // Calculate discount for packages
      let discount = 0;
      if (quantity === 3) discount = 0.10;
      else if (quantity >= 10) discount = 0.20;

      const basePrice = tree.priceBaseEur || BASE_TREE_PRICE_EUR;
      const pricePerTree = basePrice * (1 - discount);
      const totalEur = pricePerTree * quantity;
      
      const { amount, currency } = calculatePrice(totalEur, country);
      const unitAmount = Math.round((amount / quantity) * 100); // Stripe uses cents

      // Create adoption record with pending status
      const adoption = await prisma.adoption.create({
        data: {
          userId: session.user.id,
          treeId: tree.id,
          quantity,
          amount: totalEur,
          currency: 'EUR',
          status: 'pending',
          progress: 0,
          incomeType: 'one_time',
          socialFundPercentage: 30,
          socialFundAmount: totalEur * 0.3,
        },
      });

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: `Adopción: ${tree.nameEs}`,
                description: `${quantity} árbol(es) de ${tree.nameEs} - Zacapa, Guatemala`,
                images: tree.image ? [`${origin}${tree.image}`] : [],
              },
              unit_amount: unitAmount,
            },
            quantity: quantity,
          },
        ],
        metadata: {
          type: 'adoption',
          adoptionId: adoption.id,
          userId: session.user.id,
          treeId: tree.id,
          quantity: String(quantity),
        },
        customer_email: session.user.email || undefined,
        success_url: `${origin}/mi-bosque?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}?cancelled=true`,
      });

      return NextResponse.json({ 
        url: checkoutSession.url,
        sessionId: checkoutSession.id,
      });

    } else if (type === 'donation') {
      // School donation checkout
      const donationAmount = customAmount || SCHOOL_DONATION_OPTIONS[1];
      const { amount, currency } = calculatePrice(donationAmount, country);
      const unitAmount = Math.round(amount * 100); // Stripe uses cents

      // Create donation record with pending status
      const donation = await prisma.donation.create({
        data: {
          userId: session.user.id,
          amount: donationAmount,
          currency: 'EUR',
          purpose: 'school',
          status: 'pending',
        },
      });

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: 'Donación: Escuela Zacapa',
                description: '120 niños. 4 aulas. 1 sueño compartido. Tu donación construye futuro.',
                images: [`${origin}/photos/school-project.jpg`],
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: 'donation',
          donationId: donation.id,
          userId: session.user.id,
          purpose: 'school',
        },
        customer_email: session.user.email || undefined,
        success_url: `${origin}/?donation=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?donation=cancelled`,
      });

      return NextResponse.json({ 
        url: checkoutSession.url,
        sessionId: checkoutSession.id,
      });

    } else {
      return NextResponse.json({ error: 'Tipo de checkout inválido' }, { status: 400 });
    }

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}
