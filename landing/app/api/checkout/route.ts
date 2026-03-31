export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  })
  try {
    const body = await req.json()
    const { items, language } = body

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
        recurring: item.recurring ? { interval: "month" } : undefined,
      },
      quantity: item.quantity || 1,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: items.some((i: any) => i.recurring) ? "subscription" : "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXTAUTH_URL}/mi-bosque?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/carrito`,
      customer_email: body.email || undefined,
      metadata: language ? { language } : {},
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}