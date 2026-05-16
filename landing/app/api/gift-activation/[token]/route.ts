export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  const { token } = params;

  const order = await prisma.giftOrder.findUnique({
    where: { activationToken: token },
    select: {
      id: true,
      companyName: true,
      treeCount: true,
      status: true,
      tokenExpiresAt: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 404 });
  }

  if (order.status === "activated") {
    return NextResponse.json({ error: "Bereits aktiviert" }, { status: 409 });
  }

  if (new Date() > order.tokenExpiresAt) {
    await prisma.giftOrder.update({
      where: { activationToken: token },
      data: { status: "expired" },
    });
    return NextResponse.json({ error: "Token abgelaufen" }, { status: 410 });
  }

  return NextResponse.json({
    companyName: order.companyName,
    treeCount: order.treeCount,
    expiresAt: order.tokenExpiresAt,
  });
}
