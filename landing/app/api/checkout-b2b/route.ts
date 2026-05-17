export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { B2B_PLANS, B2bPlanId } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, interval } = body as { planId: B2bPlanId; interval: "month" | "year" };

    const plan = B2B_PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid planId" }, { status: 400 });
    }
    if (plan.salesLed) {
      return NextResponse.json({ error: "Enterprise plan is sales-led — use the contact form" }, { status: 400 });
    }

    const priceId = interval === "year" ? plan.priceIdYearly : plan.priceIdMonthly;
    if (!priceId) {
      return NextResponse.json({ error: "Price ID not configured for this plan/interval" }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "https://quetz.org";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/csr-partner/danke?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/csr-partner#preise`,
      allow_promotion_codes: true,
      custom_fields: [
        {
          key: "unternehmensname",
          label: { type: "custom", custom: "Name Ihres Unternehmens" },
          type: "text",
          optional: false,
        },
        {
          key: "ustid",
          label: { type: "custom", custom: "USt-IdNr. (optional)" },
          type: "text",
          optional: true,
        },
      ],
      metadata: {
        type: "b2b",
        plan: planId,
        interval,
        treesPerMonth: String(plan.treesPerMonth),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[checkout-b2b] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
