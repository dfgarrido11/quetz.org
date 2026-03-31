export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/gifts/activate  — activate a gift by code
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const gift = await prisma.gift.findUnique({ where: { code } });

    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    if (gift.status === "activated") {
      return NextResponse.json(
        { error: "Gift already activated" },
        { status: 400 }
      );
    }

    if (gift.status === "expired") {
      return NextResponse.json({ error: "Gift expired" }, { status: 400 });
    }

    // Resolve tree from planId (species) or fall back to first active tree
    let tree = await prisma.tree.findUnique({ where: { species: gift.planId } });
    if (!tree) {
      tree = await prisma.tree.findFirst({ where: { active: true } });
    }

    // Create adoption for the activating user
    if (tree) {
      await prisma.adoption.create({
        data: {
          userId: session.user.id,
          treeId: tree.id,
          quantity: gift.treesPerMonth,
          amount: gift.amountEur,
          currency: "EUR",
          status: "active",
        },
      });
    }

    const updated = await prisma.gift.update({
      where: { code },
      data: {
        status: "activated",
        activatedAt: new Date(),
        activatedByUserId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, gift: updated });
  } catch (err: any) {
    console.error("[gifts/activate POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
