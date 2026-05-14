import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STATE_FILE = "/tmp/cold-batch-state.json";
const SENT_LOG   = "/tmp/cold-email-sent-log.json";
const QUEUE_FILE = path.join(process.cwd(), "tools/cold-email-sender/queue.json");
const SENT_FILE  = path.join(process.cwd(), "tools/cold-email-sender/sent.json");

// GET /api/internal/cold-batch-status — no auth, metadata only
export async function GET() {
  // Runtime state (written by script during execution)
  type RunResult = { empresa: string; status: string; resend_id?: string; error?: string; sent_at: string };
  type StateShape = {
    status?: string;
    started_at?: string | null;
    finished_at?: string | null;
    current_run?: RunResult[];
    errors?: string[];
  };

  let runtimeState: StateShape = {};
  try {
    runtimeState = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as StateShape;
  } catch {
    runtimeState = { status: "idle" };
  }

  // Sent log (anti-dup, per-day)
  let sentToday: string[] = [];
  try {
    const log = JSON.parse(fs.readFileSync(SENT_LOG, "utf8")) as Record<string, string[]>;
    sentToday = log[todayKey()] ?? [];
  } catch { /* no log yet */ }

  // Queue state
  let queueRemaining = 0;
  let nextRun        = "2026-05-18T08:00:00Z";
  try {
    const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8")) as { batches: { scheduled_for: string }[] };
    queueRemaining = queue.batches.reduce((acc, b) => acc + 1, 0);
    if (queue.batches.length > 0) {
      nextRun = queue.batches[0].scheduled_for;
    }
  } catch { /* queue not loaded */ }

  // Sent history (last 5)
  type SentBatch = { scheduled_for: string; executed_at: string; results: RunResult[] };
  let last5Sent: { empresa: string; sent_at: string }[] = [];
  let totalSent = 0;
  try {
    const sentData = JSON.parse(fs.readFileSync(SENT_FILE, "utf8")) as { batches: SentBatch[] };
    const allSent  = sentData.batches.flatMap((b) =>
      b.results.filter((r) => r.status === "ok").map((r) => ({
        empresa: r.empresa,
        sent_at: r.sent_at,
      }))
    );
    totalSent = allSent.length;
    last5Sent = allSent.slice(-5).reverse();
  } catch { /* no sent history */ }

  return NextResponse.json({
    last_run:        runtimeState.finished_at ?? null,
    next_run:        nextRun,
    queue_remaining: queueRemaining,
    total_sent:      totalSent,
    last_5_sent:     last5Sent,
    // Extra context useful for the 09:45 CET pre-check
    current_status:  runtimeState.status ?? "idle",
    sent_today:      sentToday,
    errors:          runtimeState.errors ?? [],
    checked_at:      new Date().toISOString(),
  });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
