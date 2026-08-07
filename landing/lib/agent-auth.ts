import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Shared guard for the /api/agent/* surface.
 *
 * The external agent only ever holds AGENT_TOKEN — never Resend, Postiz or any
 * other provider credential. Nothing in here logs or echoes the token.
 */

/** Generic body for every rejection: no internal detail ever leaves the process. */
const DENIED = { error: "Unauthorized" } as const;

/** Compare two secrets in constant time, without leaking their length. */
function secretsMatch(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * A client can prepend arbitrary entries to X-Forwarded-For, so the leftmost
 * value is untrustworthy. Railway's edge appends the address it actually
 * observed, which makes the rightmost entry the one a caller cannot forge.
 */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const hops = fwd.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Strips provider-key-shaped tokens out of third-party error text before it is
 * persisted or logged, so an upstream service echoing our credential back
 * cannot park it in the database.
 */
export function redactSecrets(text: string): string {
  return text
    .replace(/re_[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .replace(/\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi, "[redacted]")
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[redacted]")
    .replace(/\b[A-Za-z0-9_-]{40,}\b/g, "[redacted]");
}

// ---------------------------------------------------------------------------
// Per-IP rate limit (in addition to the hard daily email cap).
// The Railway deploy is a single long-lived node process, so an in-memory
// sliding window is sufficient and costs no round-trip.
// ---------------------------------------------------------------------------

const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }

  hits.set(ip, [...recent, now]);

  // Opportunistic sweep so the map cannot grow without bound.
  if (hits.size > 500) {
    for (const [key, stamps] of hits) {
      if (stamps.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return false;
}

export type AgentAuthResult =
  | { ok: true; ip: string }
  | { ok: false; response: NextResponse };

/**
 * Validates `x-agent-token` and the per-IP rate limit.
 * Fails closed: if AGENT_TOKEN is unset the surface is simply unreachable.
 */
export function authorizeAgent(req: NextRequest): AgentAuthResult {
  const expected = process.env.AGENT_TOKEN;
  const provided = req.headers.get("x-agent-token");

  if (!expected || !provided || !secretsMatch(provided, expected)) {
    return { ok: false, response: NextResponse.json(DENIED, { status: 401 }) };
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": "300" } }
      ),
    };
  }

  return { ok: true, ip };
}
