#!/usr/bin/env node
/**
 * send-cold-batch.js
 *
 * Lee queue.json, encuentra el primer batch con scheduled_for <= now(),
 * envía los emails con 10 min de intervalo via Resend, y mueve el batch
 * a sent.json con timestamps.
 *
 * Flags:
 *   --dry-run    simula sin enviar ni notificar
 *
 * Archivos (relativos a este script):
 *   queue.json              batches pendientes
 *   sent.json               historial de enviados
 *   ../../data/sales-outreach/  archivos EMAIL-*.md
 *
 * State: /tmp/cold-batch-state.json  (ephemeral, para status endpoint)
 * Anti-dup: /tmp/cold-email-sent-log.json
 */

const fs    = require("fs");
const path  = require("path");
const https = require("https");

// ── Paths ─────────────────────────────────────────────────────────────────────

const QUEUE_FILE = path.join(__dirname, "queue.json");
const SENT_FILE  = path.join(__dirname, "sent.json");
const EMAILS_DIR = path.join(__dirname, "../../data/sales-outreach");
const SENT_LOG   = "/tmp/cold-email-sent-log.json";
const STATE_FILE = "/tmp/cold-batch-state.json";

// ── Config ────────────────────────────────────────────────────────────────────

const DRY_RUN  = process.argv.includes("--dry-run");
const INTERVAL = 10 * 60 * 1000;

const FROM     = "Daniel Garrido <hola@quetz.org>";
const REPLY_TO = "dgarrido@quetz.org";

const RESEND_API_KEY     = process.env.RESEND_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_ALERT_BOT_TOKEN;
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID   || process.env.TELEGRAM_ALERT_CHAT_ID;

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c]))
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function buildUtmLink(empresa) {
  return (
    "https://quetz.org/empresas" +
    "?utm_source=cold_email" +
    "&utm_medium=email" +
    "&utm_campaign=b2b_csr_nrw_may2026" +
    `&utm_content=${slugify(empresa)}`
  );
}

function parseEmailFile(filename) {
  const filePath = path.join(EMAILS_DIR, filename);
  const content  = fs.readFileSync(filePath, "utf8");
  const parts    = content.split(/^---$/m);

  if (parts.length < 3) {
    throw new Error(`${filename}: formato inválido — necesita 2 separadores ---`);
  }

  const frontmatter = parts[1].trim();
  const rest        = parts.slice(2).join("---").trim();

  const field = (key) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : null;
  };

  const paraRaw    = field("Para") || "";
  const empresa    = field("Empresa") || filename.replace(/^EMAIL-|\.md$/g, "");
  const emailMatch = paraRaw.match(/[\w.+-]+@[\w.-]+\.\w+/);

  if (!emailMatch) throw new Error(`${filename}: no se encontró email en Para: ${paraRaw}`);
  const to = emailMatch[0];

  const betreffMatch = rest.match(/^Betreff:\s*(.+)$/m);
  if (!betreffMatch) throw new Error(`${filename}: falta línea Betreff:`);
  const betreff   = betreffMatch[1].trim();
  const bodyStart = rest.indexOf(betreffMatch[0]) + betreffMatch[0].length;
  const body      = rest.slice(bodyStart).trim();

  return { to, empresa, betreff, body };
}

function injectUtm(body, empresa) {
  return body.replace(
    /(https?:\/\/)?quetz\.org\/empresas(?:\?[^\s)]+)?/g,
    buildUtmLink(empresa)
  );
}

// ── Queue / Sent ──────────────────────────────────────────────────────────────

function loadQueue() {
  return JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
}

function loadSent() {
  try { return JSON.parse(fs.readFileSync(SENT_FILE, "utf8")); }
  catch { return { batches: [] }; }
}

function saveSent(data) {
  fs.writeFileSync(SENT_FILE, JSON.stringify(data, null, 2));
}

function findReadyBatch(queue) {
  const now = new Date();
  return queue.batches.find((b) => new Date(b.scheduled_for) <= now) || null;
}

function removeBatch(queue, scheduledFor) {
  return { ...queue, batches: queue.batches.filter((b) => b.scheduled_for !== scheduledFor) };
}

// ── Anti-dup ──────────────────────────────────────────────────────────────────

function loadSentLog() {
  try { return JSON.parse(fs.readFileSync(SENT_LOG, "utf8")); }
  catch { return {}; }
}
function saveSentLog(log) { fs.writeFileSync(SENT_LOG, JSON.stringify(log, null, 2)); }
function todayKey() { return new Date().toISOString().slice(0, 10); }

// ── State (for status endpoint) ───────────────────────────────────────────────

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); }
  catch { return { status: "idle", started_at: null, finished_at: null, current_run: [], errors: [] }; }
}
function saveState(s) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); } catch { /* ignore */ }
}

// ── Network ───────────────────────────────────────────────────────────────────

function sendViaResend(to, subject, text) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY no configurada");
  const payload = JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, text });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.resend.com",
        path: "/emails",
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () =>
          res.statusCode >= 200 && res.statusCode < 300
            ? resolve(JSON.parse(data))
            : reject(new Error(`Resend ${res.statusCode}: ${data}`))
        );
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function telegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const payload = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "HTML" });
  await new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => { res.resume(); resolve(); }
    );
    req.on("error", () => resolve());
    req.write(payload);
    req.end();
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Cold Email Batch — ${startedAt}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (sin envío)" : "LIVE SEND"}`);
  console.log("=".repeat(60));

  const queue = loadQueue();
  const batch = findReadyBatch(queue);

  if (!batch) {
    if (queue.batches.length === 0) {
      const msg = "⚠️ Queue cold emails vacía — agregar empresas a queue.json";
      console.log(`\n${msg}\n`);
      if (!DRY_RUN) await telegram(msg);
    } else {
      const next = queue.batches[0];
      console.log(`\nPróximo batch no listo aún.`);
      console.log(`  scheduled_for: ${next.scheduled_for}`);
      console.log(`  ahora:         ${new Date().toISOString()}\n`);
    }
    return;
  }

  const emails = batch.emails.map((filename) => ({ filename, ...parseEmailFile(filename) }));

  // Anti-dup check
  const today   = todayKey();
  const sentLog = loadSentLog();
  if (!DRY_RUN && sentLog[today]) {
    console.error(`\n🛑 ABORTADO — Anti-dup: ya enviados hoy (${today}): ${sentLog[today].join(", ")}`);
    console.error(`Para re-enviar manualmente: rm ${SENT_LOG}`);
    process.exit(1);
  }

  // Print preview
  console.log(`\nBatch: ${batch.scheduled_for}`);
  console.log(`${emails.length} emails:\n`);
  emails.forEach((e, i) => {
    console.log(`  [${i + 1}] ${e.empresa} <${e.to}>`);
    console.log(`       Betreff: ${e.betreff}`);
    console.log(`       UTM:     ${buildUtmLink(e.empresa)}\n`);
  });

  if (DRY_RUN) {
    console.log("── DRY RUN COMPLETO — nada enviado ──\n");
    emails.forEach((e) => {
      console.log(`${"─".repeat(55)}`);
      console.log(`[${e.empresa}]  ${e.betreff}`);
      console.log("─".repeat(55));
      console.log(injectUtm(e.body, e.empresa));
      console.log();
    });
    return;
  }

  // Live send
  saveState({ status: "running", started_at: startedAt, finished_at: null, current_run: [], errors: [] });

  const results   = [];
  const sentToday = [];

  for (let i = 0; i < emails.length; i++) {
    const e = emails[i];
    if (i > 0) {
      console.log("⏳ Esperando 10 min...");
      await sleep(INTERVAL);
    }
    const hora = new Date().toLocaleTimeString("de-DE", {
      timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit",
    });
    console.log(`[${i + 1}/${emails.length}] → ${e.empresa} <${e.to}>`);

    try {
      const res = await sendViaResend(e.to, e.betreff, injectUtm(e.body, e.empresa));
      console.log(`  ✅ ${res.id}`);
      const entry = {
        empresa: e.empresa, status: "ok",
        resend_id: res.id, sent_at: new Date().toISOString(),
      };
      results.push(entry);
      sentToday.push(e.empresa);
      saveState({ status: "running", started_at: startedAt, finished_at: null, current_run: results, errors: [] });
      await telegram(`📤 Cold email enviado\n<b>${e.empresa}</b>\n${e.betreff}\n🕐 ${hora} CET`);
    } catch (err) {
      console.error(`  ❌ ${err.message}`);
      results.push({ empresa: e.empresa, status: "error", error: err.message, sent_at: new Date().toISOString() });
      await telegram(`❌ FALLO cold email\n<b>${e.empresa}</b>\n${err.message}`);
    }
  }

  // Persist anti-dup
  if (sentToday.length > 0) {
    sentLog[today] = sentToday;
    saveSentLog(sentLog);
  }

  // Move batch: queue.json → sent.json
  const completedBatch = {
    scheduled_for: batch.scheduled_for,
    executed_at:   new Date().toISOString(),
    emails:        batch.emails,
    results,
  };
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(removeBatch(queue, batch.scheduled_for), null, 2));
  const sentData = loadSent();
  sentData.batches.push(completedBatch);
  saveSent(sentData);

  // Final state
  const finishedAt = new Date().toISOString();
  const errors     = results.filter((r) => r.status === "error").map((r) => r.error);
  saveState({ status: "idle", started_at: startedAt, finished_at: finishedAt, current_run: results, errors });

  const lines   = results.map((r) => `${r.status === "ok" ? "✅" : "❌"} ${r.empresa}`);
  const summary = `📊 Cold batch completado\n${lines.join("\n")}\n${sentToday.length}/${emails.length} enviados`;
  console.log(`\n${summary}`);
  await telegram(summary);
}

main().catch((err) => {
  console.error("💥", err.message);
  saveState({ ...loadState(), status: "error", errors: [err.message] });
  process.exit(1);
});
