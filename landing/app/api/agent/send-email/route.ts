import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAgent, redactSecrets } from "@/lib/agent-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIMARY_FROM = "Daniel Garrido | quetz.org <hola@quetz.org>";
const FALLBACK_FROM = "Daniel Garrido | quetz.org <onboarding@resend.dev>";

const MAX_PER_DAY = 10;
const COOLDOWN_DAYS = 30;

/** Arbitrary fixed key so every agent send contends on the same advisory lock. */
const QUOTA_LOCK_KEY = 8_231_407;

const MAX_SUBJECT = 200;
const MAX_HTML = 100_000;

// Deliberately conservative: a single address, no display names, no routing syntax.
const EMAIL_RE = /^[^\s@,<>"]+@[^\s@,<>".]+\.[a-zA-Z]{2,}$/;

type Payload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

function validate(body: unknown): { data: Payload } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Body must be a JSON object" };
  const b = body as Record<string, unknown>;

  const to = typeof b.to === "string" ? b.to.trim() : "";
  const subject = typeof b.subject === "string" ? b.subject.trim() : "";
  const html = typeof b.html === "string" ? b.html : "";

  if (!EMAIL_RE.test(to) || to.length > 254) return { error: "Invalid 'to' address" };
  if (!subject) return { error: "'subject' is required" };
  if (subject.length > MAX_SUBJECT) return { error: "'subject' too long" };
  if (/[\r\n]/.test(subject)) return { error: "'subject' contains invalid characters" };
  if (!html) return { error: "'html' is required" };
  if (html.length > MAX_HTML) return { error: "'html' too long" };

  const text = typeof b.text === "string" ? b.text : undefined;
  const replyTo = typeof b.replyTo === "string" ? b.replyTo.trim() : undefined;
  if (replyTo && !EMAIL_RE.test(replyTo)) return { error: "Invalid 'replyTo' address" };

  return { data: { to, subject, html, text, replyTo } };
}

type SendOutcome =
  | { sent: true; from: string; messageId: string | null; usedFallback: boolean }
  | { sent: false; reason: string };

/** Resend rejects an unverified sending domain with 403/422 and a domain-shaped message. */
function looksLikeUnverifiedDomain(status: number, detail: string): boolean {
  if (status !== 403 && status !== 422 && status !== 401) return false;
  return /domain|verif|not allowed|testing emails/i.test(detail);
}

async function postToResend(apiKey: string, from: string, p: Payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: p.to,
      subject: p.subject,
      html: p.html,
      ...(p.text ? { text: p.text } : {}),
      ...(p.replyTo ? { reply_to: p.replyTo } : {}),
    }),
  });

  const raw = await res.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Non-JSON error page — keep `raw` as the detail.
  }

  return {
    ok: res.ok,
    status: res.status,
    id: parsed.id as string | undefined,
    detail: redactSecrets(raw).slice(0, 300),
  };
}

async function send(apiKey: string, p: Payload): Promise<SendOutcome> {
  const first = await postToResend(apiKey, PRIMARY_FROM, p);
  if (first.ok) {
    return { sent: true, from: PRIMARY_FROM, messageId: first.id ?? null, usedFallback: false };
  }

  if (!looksLikeUnverifiedDomain(first.status, first.detail)) {
    return { sent: false, reason: `resend ${first.status}: ${first.detail}` };
  }

  const second = await postToResend(apiKey, FALLBACK_FROM, p);
  if (second.ok) {
    return { sent: true, from: FALLBACK_FROM, messageId: second.id ?? null, usedFallback: true };
  }

  return { sent: false, reason: `resend fallback ${second.status}: ${second.detail}` };
}

export async function POST(req: NextRequest) {
  const auth = authorizeAgent(req);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const checked = validate(body);
  if ("error" in checked) {
    return NextResponse.json({ error: checked.error }, { status: 400 });
  }
  const payload = checked.data;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email provider not configured" },
      { status: 503 }
    );
  }

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const cooldownSince = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

  const recipient = payload.to.toLowerCase();

  try {
    // Both quotas are read-then-write, so they must be serialised: two
    // concurrent requests would otherwise each see a count below the cap and
    // both proceed. A transaction-scoped advisory lock makes the whole
    // check-and-reserve atomic across requests; the slow Resend call happens
    // afterwards, outside the lock.
    const reservation = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${QUOTA_LOCK_KEY})`;

      const sentToday = await tx.agentEmailLog.count({
        where: { createdAt: { gte: startOfDay }, status: { in: ["sent", "sending"] } },
      });

      if (sentToday >= MAX_PER_DAY) {
        await tx.agentEmailLog.create({
          data: {
            to: recipient,
            subject: payload.subject,
            status: "blocked",
            error: "daily cap reached",
            ip: auth.ip,
          },
        });
        return { blocked: "cap" as const, sentToday };
      }

      const previous = await tx.agentEmailLog.findFirst({
        where: {
          to: recipient,
          status: { in: ["sent", "sending"] },
          createdAt: { gte: cooldownSince },
        },
        select: { createdAt: true },
      });

      if (previous) {
        await tx.agentEmailLog.create({
          data: {
            to: recipient,
            subject: payload.subject,
            status: "blocked",
            error: "recipient contacted within cooldown",
            ip: auth.ip,
          },
        });
        return { blocked: "cooldown" as const, lastContactedAt: previous.createdAt };
      }

      // Reserve the slot while still holding the lock.
      const log = await tx.agentEmailLog.create({
        data: {
          to: recipient,
          subject: payload.subject,
          status: "sending",
          provider: "resend",
          ip: auth.ip,
        },
      });

      return { blocked: null, log, sentToday };
    });

    if (reservation.blocked === "cap") {
      return NextResponse.json(
        { error: "Daily send limit reached", limit: MAX_PER_DAY, sentToday: reservation.sentToday },
        { status: 429 }
      );
    }

    if (reservation.blocked === "cooldown") {
      return NextResponse.json(
        {
          error: "Recipient already contacted recently",
          cooldownDays: COOLDOWN_DAYS,
          lastContactedAt: reservation.lastContactedAt.toISOString(),
        },
        { status: 409 }
      );
    }

    const { log, sentToday } = reservation;

    const outcome = await send(apiKey, payload);

    if (!outcome.sent) {
      await prisma.agentEmailLog.update({
        where: { id: log.id },
        data: { status: "failed", error: outcome.reason },
      });
      console.error("[agent/send-email] provider rejected send", { logId: log.id });
      return NextResponse.json({ error: "Email provider rejected the request" }, { status: 502 });
    }

    await prisma.agentEmailLog.update({
      where: { id: log.id },
      data: { status: "sent", messageId: outcome.messageId, fromUsed: outcome.from },
    });

    return NextResponse.json({
      ok: true,
      id: log.id,
      messageId: outcome.messageId,
      from: outcome.from,
      usedFallbackSender: outcome.usedFallback,
      sentToday: sentToday + 1,
      remainingToday: MAX_PER_DAY - sentToday - 1,
    });
  } catch (err) {
    console.error("[agent/send-email] unexpected failure", {
      name: err instanceof Error ? err.name : "unknown",
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
