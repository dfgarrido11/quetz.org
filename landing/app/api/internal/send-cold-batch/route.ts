import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// POST /api/internal/send-cold-batch
// Header: X-Cron-Secret: <CRON_SECRET>
// Body:   { "dry_run": true|false, "mode": "queue"|"direct" }

export async function POST(req: NextRequest) {
  // Auth
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { dry_run?: boolean; mode?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const dryRun = body.dry_run === true;
  const mode = body.mode === "direct" ? "direct" : "queue";

  const scriptPath = path.join(process.cwd(), "../tools/cold-email-sender/send-cold-batch.js");

  const args = ["--queue"];
  if (dryRun) args.push("--dry-run");

  // Fire and forget — the script runs 40+ min, response returns immediately
  const child = spawn("node", [scriptPath, ...args], {
    detached: true,
    stdio: "ignore",
    env: { ...process.env },
  });
  child.unref();

  return NextResponse.json(
    {
      ok: true,
      dry_run: dryRun,
      mode,
      script: scriptPath,
      args,
      started_at: new Date().toISOString(),
      message: dryRun
        ? "Dry-run iniciado en background. Revisa Railway logs."
        : "Batch de envío iniciado en background. Revisa Telegram y /api/internal/cold-batch-status",
    },
    { status: 202 }
  );
}
