export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Unambiguous uppercase alphanumeric chars (no 0/O/I/1)
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateGiftCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

async function uniqueGiftCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateGiftCode();
    const existing = await prisma.gift.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Failed to generate unique gift code");
}

// GET /api/gifts?code=XXXXXXXX
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const gift = await prisma.gift.findUnique({ where: { code } });
  if (!gift) {
    return NextResponse.json({ error: "Gift not found" }, { status: 404 });
  }

  const payload = {
    id: gift.id,
    code: gift.code,
    planName: gift.planName,
    treesPerMonth: gift.treesPerMonth,
    durationMonths: gift.durationMonths,
    recipientName: gift.recipientName,
    occasion: gift.occasion,
    message: gift.message,
    status: gift.status,
    amountEur: gift.amountEur,
    activatedAt: gift.activatedAt,
    expired: gift.status === "expired",
  };

  return NextResponse.json({ gift: payload });
}

// POST /api/gifts  — create a new pending gift
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      planId,
      planName,
      treesPerMonth,
      durationMonths,
      amountEur,
      senderEmail,
      recipientName,
      recipientEmail,
      occasion,
      message,
      scheduledAt,
    } = body;

    if (!planName || !recipientName || !recipientEmail) {
      return NextResponse.json(
        { error: "planName, recipientName and recipientEmail are required" },
        { status: 400 }
      );
    }

    const code = await uniqueGiftCode();

    const gift = await prisma.gift.create({
      data: {
        code,
        planId: planId ?? "custom",
        planName,
        treesPerMonth: treesPerMonth ?? 1,
        durationMonths: durationMonths ?? 12,
        amountEur: amountEur ?? 0,
        senderEmail: senderEmail ?? null,
        recipientName,
        recipientEmail,
        occasion: occasion ?? "otro",
        message: message ?? null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: "pending",
      },
    });

    return NextResponse.json({ id: gift.id, code: gift.code }, { status: 201 });
  } catch (err: any) {
    console.error("[gifts POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
