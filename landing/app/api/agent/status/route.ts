import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAgent } from "@/lib/agent-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PER_DAY = 10;

export async function GET(req: NextRequest) {
  const auth = authorizeAgent(req);
  if (!auth.ok) return auth.response;

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  try {
    const [sentToday, sentTotal, blockedTotal, failedTotal, recent, queuedSocial] =
      await Promise.all([
        prisma.agentEmailLog.count({
          where: { createdAt: { gte: startOfDay }, status: { in: ["sent", "sending"] } },
        }),
        prisma.agentEmailLog.count({ where: { status: "sent" } }),
        prisma.agentEmailLog.count({ where: { status: "blocked" } }),
        prisma.agentEmailLog.count({ where: { status: "failed" } }),
        prisma.agentEmailLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, to: true, subject: true, status: true, createdAt: true },
        }),
        prisma.socialQueue.count({ where: { status: "queued" } }),
      ]);

    return NextResponse.json({
      ok: true,
      email: {
        sentToday,
        remainingToday: Math.max(0, MAX_PER_DAY - sentToday),
        dailyLimit: MAX_PER_DAY,
        sentTotal,
        blockedTotal,
        failedTotal,
        cooldownDays: 30,
      },
      social: { queued: queuedSocial },
      recent: recent.map((r) => ({
        id: r.id,
        to: r.to,
        subject: r.subject,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
      providers: {
        // Booleans only — provider credentials never leave the server.
        resend: Boolean(process.env.RESEND_API_KEY),
        postiz: Boolean(process.env.POSTIZ_API_KEY),
      },
    });
  } catch (err) {
    console.error("[agent/status] unexpected failure", {
      name: err instanceof Error ? err.name : "unknown",
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
