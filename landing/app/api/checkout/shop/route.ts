import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail } = await req.json()

    if (!items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Calculate total trees for the order
    const totalTrees = items.reduce((sum: number, item: any) => sum + (item.trees || 0) * (item.quantity || 1), 0)

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: `🌱 Incluye ${item.trees} árbol${item.trees > 1 ? 'es' : ''} adoptado${item.trees > 1 ? 's' : ''} en Zacapa, Guatemala`,
          images: item.imageUrl ? [item.imageUrl] : [],
          metadata: {
            productId: item.id,
            ref: item.ref,
            trees: String(item.trees),
            size: item.size || '',
            color: item.color || '',
            gelatoProductUid: item.gelatoProductUid || '',
            mascot: item.mascot || '',
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
        totalTrees: String(totalTrees),
        items: JSON.stringify(items.map((i: any) => ({
          id: i.id,
          qty: i.quantity,
          size: i.size,
          color: i.color,
          trees: i.trees,
          gelatoProductUid: i.gelatoProductUid,
          mascot: i.mascot,
        }))),
      },
      payment_intent_data: {
        metadata: {
          type: 'shop_purchase',
          source: 'quetz_shop',
          totalTrees: String(totalTrees),
        },
      },
      // Collect shipping address for Gelato fulfillment
      shipping_address_collection: {
        allowed_countries: [
          'DE', 'AT', 'CH', 'ES', 'FR', 'IT', 'NL', 'BE', 'LU', 'PT',
          'GB', 'IE', 'DK', 'SE', 'NO', 'FI', 'PL', 'CZ', 'US', 'CA',
          'MX', 'GT', 'CR', 'PA', 'CO', 'AR', 'CL', 'BR', 'PE', 'EC',
        ],
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[Checkout/Shop] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
