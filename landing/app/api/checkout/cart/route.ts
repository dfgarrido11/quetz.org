import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  })
  try {
    const body = await req.json()
    const { items } = body

    const isSubscription = items.some((i: any) => i.planId || i.recurring || i.type === 'subscription')

    const lineItems = items.map((item: any) => {
      const priceData: any = {
        currency: "eur",
        product_data: { name: item.name || item.planName || "Árbol quetz.org" },
        unit_amount: Math.round((item.pricePerUnit || item.price || 5) * 100),
      }
      if (isSubscription) {
        priceData.recurring = { interval: "month" }
      }
      return { price_data: priceData, quantity: item.quantity || 1 }
    })

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXTAUTH_URL}/mi-bosque?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/carrito`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
