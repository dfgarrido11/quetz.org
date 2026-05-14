import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STATE_FILE = "/tmp/cold-batch-state.json";
const SENT_LOG   = "/tmp/cold-email-sent-log.json";
const QUEUE_FILE = path.join(process.cwd(), "../tools/cold-email-sender/queue.json");

// GET /api/internal/cold-batch-status
// Header: X-Cron-Secret: <CRON_SECRET>  (optional — public-ish but scoped)
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Runtime state (written by script)
  let runtimeState: Record<string, unknown> = {};
  try {
    runtimeState = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    runtimeState = { status: "idle", note: "No se ha ejecutado ningún batch en esta instancia" };
  }

  // Anti-dup log
  let sentLog: Record<string, string[]> = {};
  try {
    sentLog = JSON.parse(fs.readFileSync(SENT_LOG, "utf8"));
  } catch {
    sentLog = {};
  }

  // Queue state
  let queueState: { total: number; pending: string[]; sent_in_history: string[] } = {
    total: 0,
    pending: [],
    sent_in_history: [],
  };
  try {
    const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
    const history: { sent?: string[] }[] = (runtimeState.history as { sent?: string[] }[]) || [];
    const sentEmpresas = new Set(history.flatMap((r) => r.sent || []));
    queueState = {
      total: queue.emails.length,
      pending: queue.emails
        .filter((e: { empresa: string }) => !sentEmpresas.has(e.empresa))
        .map((e: { empresa: string }) => e.empresa),
      sent_in_history: [...sentEmpresas],
    };
  } catch {
    queueState.total = -1;
  }

  // Next scheduled run: 2026-05-15T08:00:00Z (first scheduled)
  // After that: Mon/Wed/Fri at 08:00 UTC
  const nextRun = computeNextRun();

  return NextResponse.json({
    status: runtimeState.status ?? "idle",
    started_at: runtimeState.started_at ?? null,
    finished_at: runtimeState.finished_at ?? null,
    current_run: runtimeState.current_run ?? [],
    errors: runtimeState.errors ?? [],
    emails_sent_today: sentLog[todayKey()] ?? [],
    queue: queueState,
    next_run: nextRun,
    checked_at: new Date().toISOString(),
  });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function computeNextRun(): string {
  const now = new Date();
  // Scheduled days: Mon(1), Wed(3), Fri(5) at 08:00 UTC
  const scheduledDays = [1, 3, 5];
  const candidate = new Date(now);
  candidate.setUTCHours(8, 0, 0, 0);

  for (let i = 0; i <= 7; i++) {
    const d = new Date(candidate);
    d.setUTCDate(candidate.getUTCDate() + i);
    if (scheduledDays.includes(d.getUTCDay()) && d > now) {
      return d.toISOString();
    }
  }
  return "unknown";
}
