export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/gifts/activate  — activate a gift by code
export async function POST(req: NextRequest) {
  try {
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

    const updated = await prisma.gift.update({
      where: { code },
      data: {
        status: "activated",
        activatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, gift: updated });
  } catch (err: any) {
    console.error("[gifts/activate POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
