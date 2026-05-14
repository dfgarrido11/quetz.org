import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// POST /api/internal/send-cold-batch
// Header: X-Cron-Secret: <CRON_SECRET>
// Body (optional): { "dry_run": true }

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let dry_run = false;
  try {
    const body = await req.json();
    dry_run = body.dry_run === true;
  } catch {
    // empty body — default to live send
  }

  // Script is inside landing/ so it's available in the Railway deploy
  const scriptPath = path.join(process.cwd(), "tools/cold-email-sender/send-cold-batch.js");
  const args = dry_run ? ["--dry-run"] : [];

  // Fire and forget — script runs 40+ min, HTTP returns immediately
  const child = spawn("node", [scriptPath, ...args], {
    detached: true,
    stdio: "ignore",
    env: { ...process.env },
  });
  child.unref();

  return NextResponse.json(
    {
      ok: true,
      dry_run,
      started_at: new Date().toISOString(),
      message: dry_run
        ? "Dry-run iniciado. Revisa Railway logs."
        : "Batch iniciado. Revisa Telegram + GET /api/internal/cold-batch-status",
    },
    { status: 202 }
  );
}
