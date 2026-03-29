import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail } = await req.json()

    if (!items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: `${item.trees} árbol${item.trees > 1 ? 'es' : ''} plantado${item.trees > 1 ? 's' : ''} con esta compra 🌱`,
          images: item.imageUrl ? [item.imageUrl] : [],
          metadata: {
            productId: item.id,
            ref: item.ref,
            trees: String(item.trees),
            size: item.size || '',
            color: item.color || '',
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail || undefined,
      success_url: `${process.env.NEXTAUTH_URL}/shop?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/shop?cancelled=true`,
      metadata: {
        type: 'shop',
        items: JSON.stringify(items.map((i: any) => ({ id: i.id, qty: i.quantity, size: i.size, color: i.color }))),
      },
      payment_intent_data: {
        metadata: {
          type: 'shop_purchase',
          source: 'quetz_shop',
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
