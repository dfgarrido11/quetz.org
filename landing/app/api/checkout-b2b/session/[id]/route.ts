export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
    const session = await stripe.checkout.sessions.retrieve(params.id);
    return NextResponse.json({
      customerEmail: session.customer_details?.email ?? "",
      customerName: session.customer_details?.name ?? "",
      planId: session.metadata?.plan ?? "",
      interval: session.metadata?.interval ?? "month",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
