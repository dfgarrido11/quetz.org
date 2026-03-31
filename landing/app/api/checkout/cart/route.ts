export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  })
  try {
    const body = await req.json()
    const { items, recipientName, recipientEmail, occasion, message, senderEmail, language } = body

    const isSubscription = items.some((i: any) => i.planId || i.recurring || i.type === 'subscription')
    const hasGift = items.some((i: any) => i.isGift === true)

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

    const metadata: Record<string, string> = {}
    if (language) metadata.language = language
    if (hasGift) {
      metadata.isGift = "true"
      if (recipientName) metadata.recipientName = recipientName
      if (recipientEmail) metadata.recipientEmail = recipientEmail
      if (occasion) metadata.occasion = occasion
      if (message) metadata.message = message
      if (senderEmail) metadata.senderEmail = senderEmail
    }

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXTAUTH_URL}/mi-bosque?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/carrito`,
      metadata,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}