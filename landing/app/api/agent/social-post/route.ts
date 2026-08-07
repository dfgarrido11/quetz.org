import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAgent, redactSecrets } from "@/lib/agent-auth";
import { assertPublicHttpsUrl } from "@/lib/agent-net-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fixed on purpose: POSTIZ_API_KEY must only ever travel to our own instance.
const POSTIZ_BASE = "https://postiz.quetz.org/api/public/v1";

const MAX_CONTENT = 5_000;
const MAX_IMAGE_URL = 2_048;

type Payload = {
  content: string;
  imageUrl?: string;
  platforms: string[];
  scheduleAt?: string;
};

/**
 * Postiz 2.x returns the platform under `identifier` ("instagram", "x", …).
 * `providerIdentifier` is accepted too because other Postiz versions use that
 * name — reading only one of them is what previously made a connected channel
 * look like no channel at all.
 */
type RawIntegration = {
  id: string;
  name?: string;
  identifier?: string;
  providerIdentifier?: string;
  disabled?: boolean;
};

type Integration = { id: string; platform: string; name: string; disabled: boolean };

function normalizeIntegration(raw: RawIntegration): Integration {
  return {
    id: raw.id,
    platform: (raw.identifier ?? raw.providerIdentifier ?? "").toLowerCase(),
    name: raw.name ?? raw.id,
    disabled: raw.disabled === true,
  };
}

/** Postiz rejects a schedule further out than this, and it is well past any sane use. */
const MAX_SCHEDULE_DAYS = 90;

/**
 * Required per-platform fields in Postiz's `settings` object. Instagram rejects
 * a post outright without `post_type`, so this is not optional decoration.
 */
const PLATFORM_SETTINGS: Record<string, Record<string, unknown>> = {
  instagram: { post_type: "post" },
};

async function validate(body: unknown): Promise<{ data: Payload } | { error: string }> {
  if (typeof body !== "object" || body === null) return { error: "Body must be a JSON object" };
  const b = body as Record<string, unknown>;

  const content = typeof b.content === "string" ? b.content.trim() : "";
  if (!content) return { error: "'content' is required" };
  if (content.length > MAX_CONTENT) return { error: "'content' too long" };

  let imageUrl: string | undefined;
  if (b.imageUrl !== undefined && b.imageUrl !== null) {
    if (typeof b.imageUrl !== "string") return { error: "'imageUrl' must be a string" };
    if (b.imageUrl.length > MAX_IMAGE_URL) return { error: "'imageUrl' too long" };
    // Postiz fetches this URL server-side from inside the private network.
    const problem = await assertPublicHttpsUrl(b.imageUrl);
    if (problem) return { error: `'imageUrl' ${problem}` };
    imageUrl = b.imageUrl;
  }

  let platforms: string[] = [];
  if (b.platforms !== undefined && b.platforms !== null) {
    if (!Array.isArray(b.platforms) || b.platforms.some((p) => typeof p !== "string")) {
      return { error: "'platforms' must be an array of strings" };
    }
    platforms = (b.platforms as string[]).map((p) => p.trim().toLowerCase()).filter(Boolean);
  }

  let scheduleAt: string | undefined;
  if (b.scheduleAt !== undefined && b.scheduleAt !== null) {
    if (typeof b.scheduleAt !== "string") return { error: "'scheduleAt' must be an ISO date string" };
    const when = new Date(b.scheduleAt);
    if (Number.isNaN(when.getTime())) return { error: "'scheduleAt' is not a valid date" };
    if (when.getTime() <= Date.now()) return { error: "'scheduleAt' must be in the future" };
    if (when.getTime() - Date.now() > MAX_SCHEDULE_DAYS * 86_400_000) {
      return { error: `'scheduleAt' must be within ${MAX_SCHEDULE_DAYS} days` };
    }
    scheduleAt = when.toISOString();
  }

  return { data: { content, imageUrl, platforms, scheduleAt } };
}

/**
 * Always fetched fresh: a channel connected in Postiz must be visible to the
 * very next request, and a stale empty list silently downgrades a publish into
 * a queue insert.
 */
async function listIntegrations(apiKey: string): Promise<Integration[]> {
  const res = await fetch(`${POSTIZ_BASE}/integrations`, {
    headers: { Authorization: apiKey },
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`integrations ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return (data as RawIntegration[]).map(normalizeIntegration).filter((i) => !i.disabled);
}

async function publish(apiKey: string, targets: Integration[], p: Payload) {
  const res = await fetch(`${POSTIZ_BASE}/posts`, {
    method: "POST",
    headers: { Authorization: apiKey, "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      // Postiz wants a date either way; for an immediate post it just uses now.
      type: p.scheduleAt ? "schedule" : "now",
      date: p.scheduleAt ?? new Date().toISOString(),
      shortLink: false,
      tags: [],
      posts: targets.map((t) => ({
        integration: { id: t.id },
        value: [
          {
            content: p.content,
            // Always an array — Postiz rejects the field being absent, even
            // for a text-only post.
            image: p.imageUrl ? [{ id: p.imageUrl, path: p.imageUrl }] : [],
          },
        ],
        settings: { __type: t.platform, ...(PLATFORM_SETTINGS[t.platform] ?? {}) },
      })),
    }),
  });

  const raw = redactSecrets(await res.text());
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Non-JSON error page — `detail` still carries the text.
  }

  return { ok: res.ok, status: res.status, detail: raw.slice(0, 300), body: parsed };
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

  const checked = await validate(body);
  if ("error" in checked) {
    return NextResponse.json({ error: checked.error }, { status: 400 });
  }
  const payload = checked.data;

  const queue = async (reason: string) =>
    prisma.socialQueue.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl ?? null,
        platforms: payload.platforms,
        status: "queued",
        error: reason,
      },
    });

  try {
    const apiKey = process.env.POSTIZ_API_KEY;

    if (!apiKey) {
      const row = await queue("POSTIZ_API_KEY not configured");
      return NextResponse.json({ ok: true, queued: true, id: row.id, reason: "provider_not_configured" });
    }

    let integrations: Integration[];
    try {
      integrations = await listIntegrations(apiKey);
    } catch {
      const row = await queue("Postiz unreachable");
      console.error("[agent/social-post] could not reach Postiz; queued instead");
      return NextResponse.json({ ok: true, queued: true, id: row.id, reason: "provider_unreachable" });
    }

    const targets = payload.platforms.length
      ? integrations.filter((i) => payload.platforms.includes(i.platform))
      : integrations;

    if (targets.length === 0) {
      const row = await queue(
        integrations.length === 0
          ? "no social channels connected in Postiz"
          : "no channel matched the requested platforms"
      );
      return NextResponse.json({
        ok: true,
        queued: true,
        id: row.id,
        reason: integrations.length === 0 ? "no_channels_connected" : "no_matching_channel",
        availablePlatforms: integrations.map((i) => i.platform).filter(Boolean),
      });
    }

    const result = await publish(apiKey, targets, payload);

    if (!result.ok) {
      const row = await prisma.socialQueue.create({
        data: {
          content: payload.content,
          imageUrl: payload.imageUrl ?? null,
          platforms: payload.platforms,
          status: "failed",
          error: `postiz ${result.status}: ${result.detail}`,
        },
      });
      console.error("[agent/social-post] Postiz rejected the post", { id: row.id });
      return NextResponse.json({ error: "Social provider rejected the request", id: row.id }, { status: 502 });
    }

    const row = await prisma.socialQueue.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl ?? null,
        platforms: targets.map((t) => t.platform),
        // A scheduled post is accepted by Postiz but not out yet, so it is not
        // "published" — leaving publishedAt null keeps that distinction honest.
        status: payload.scheduleAt ? "scheduled" : "published",
        publishedAt: payload.scheduleAt ? null : new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      queued: false,
      published: !payload.scheduleAt,
      scheduledAt: payload.scheduleAt ?? null,
      id: row.id,
      channels: targets.map((t) => t.platform),
      provider: result.body,
    });
  } catch (err) {
    console.error("[agent/social-post] unexpected failure", {
      name: err instanceof Error ? err.name : "unknown",
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
