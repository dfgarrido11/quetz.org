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
};

type Integration = { id: string; providerIdentifier?: string; name?: string };

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

  return { data: { content, imageUrl, platforms } };
}

async function listIntegrations(apiKey: string): Promise<Integration[]> {
  const res = await fetch(`${POSTIZ_BASE}/integrations`, {
    headers: { Authorization: apiKey },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`integrations ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? (data as Integration[]) : [];
}

async function publish(apiKey: string, targets: Integration[], p: Payload) {
  const res = await fetch(`${POSTIZ_BASE}/posts`, {
    method: "POST",
    headers: { Authorization: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "now",
      shortLink: false,
      tags: [],
      posts: targets.map((t) => ({
        integration: { id: t.id },
        value: [
          {
            content: p.content,
            ...(p.imageUrl ? { image: [{ id: p.imageUrl, path: p.imageUrl }] } : {}),
          },
        ],
        settings: { __type: t.providerIdentifier ?? "generic" },
      })),
    }),
  });

  const detail = redactSecrets(await res.text()).slice(0, 300);
  return { ok: res.ok, status: res.status, detail };
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
      ? integrations.filter((i) =>
          payload.platforms.includes((i.providerIdentifier ?? "").toLowerCase())
        )
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
        availablePlatforms: integrations.map((i) => i.providerIdentifier).filter(Boolean),
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
        platforms: targets.map((t) => t.providerIdentifier ?? t.id),
        status: "published",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      queued: false,
      published: true,
      id: row.id,
      channels: targets.map((t) => t.providerIdentifier ?? t.id),
    });
  } catch (err) {
    console.error("[agent/social-post] unexpected failure", {
      name: err instanceof Error ? err.name : "unknown",
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
