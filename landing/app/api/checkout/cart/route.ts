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

    // Stripe does NOT allow mixing subscription and one-time items in the same session.
    const subscriptionItems = items.filter((i: any) => i.planId || i.type === 'subscription')
    const oneTimeItems = items.filter((i: any) => !i.planId && i.type !== 'subscription')
    const isSubscription = subscriptionItems.length > 0
    // If mixed cart: process subscriptions first (safety net; UI should prevent this)
    const itemsToProcess = isSubscription ? subscriptionItems : oneTimeItems
    const hasGift = itemsToProcess.some((i: any) => i.isGift === true)

    const lineItems = itemsToProcess.map((item: any) => {
      const priceData: any = {
        currency: "eur",
        product_data: { name: item.name || item.planName || item.treeName || "Árbol quetz.org" },
        unit_amount: Math.round((item.pricePerUnit || item.price || 5) * 100),
      }
      if (isSubscription) {
        priceData.recurring = { interval: "month" }
      }
      return { price_data: priceData, quantity: item.quantity || 1 }
    })

    const metadata: Record<string, string> = {}
    if (language) metadata.language = language

    // Pass purchase details for webhook DB record creation
    const firstItem = itemsToProcess[0]
    if (firstItem) {
      if (firstItem.planId) metadata.planId = firstItem.planId
      if (firstItem.treeId) metadata.treeId = firstItem.treeId
      if (firstItem.planName || firstItem.treeName) metadata.planName = firstItem.planName || firstItem.treeName || ''
      if (firstItem.treesPerMonth) metadata.treesPerMonth = String(firstItem.treesPerMonth)
      const totalQty = itemsToProcess.reduce((s: number, i: any) => s + (i.quantity || 1), 0)
      metadata.quantity = String(totalQty)
    }

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
      success_url: `${process.env.NEXTAUTH_URL}/mi-bosque?cart=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/carrito`,
      metadata,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}