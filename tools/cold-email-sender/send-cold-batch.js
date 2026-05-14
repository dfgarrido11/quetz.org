#!/usr/bin/env node
/**
 * send-cold-batch.js
 *
 * Modos:
 *   --dry-run   imprime los emails sin enviar (default para testing)
 *   --queue     lee queue.json y envía los próximos N no enviados
 *   (sin flags)  lee los EMAIL-*.md directamente (modo legado)
 *
 * State: /tmp/cold-batch-state.json  (runtime, ephemeral por instancia Railway)
 * Anti-dup: /tmp/cold-email-sent-log.json
 */

const fs   = require("fs");
const path = require("path");
const https = require("https");

// ── Config ────────────────────────────────────────────────────────────────────

const DRY_RUN   = process.argv.includes("--dry-run");
const QUEUE_MODE = process.argv.includes("--queue");

const SENT_LOG      = "/tmp/cold-email-sent-log.json";
const STATE_FILE    = "/tmp/cold-batch-state.json";
const EMAILS_DIR    = path.join(__dirname, "../../landing/data/sales-outreach");
const QUEUE_FILE    = path.join(__dirname, "queue.json");
const BATCH_SIZE    = 5;
const INTERVAL_MS   = 10 * 60 * 1000; // 10 min

const FROM     = "Daniel Garrido <hola@quetz.org>";
const REPLY_TO = "dgarrido@quetz.org";

const RESEND_API_KEY      = process.env.RESEND_API_KEY;
const TELEGRAM_BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN  || process.env.TELEGRAM_ALERT_BOT_TOKEN;
const TELEGRAM_CHAT_ID    = process.env.TELEGRAM_CHAT_ID    || process.env.TELEGRAM_ALERT_CHAT_ID;

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(empresa) {
  return empresa
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c]))
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function buildUtmLink(empresa) {
  const slug = slugify(empresa);
  return `https://quetz.org/empresas?utm_source=cold_email&utm_medium=email&utm_campaign=b2b_csr_nrw_may2026&utm_content=${slug}`;
}

function parseEmailFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const parts = content.split(/^---$/m);
  if (parts.length < 3) {
    throw new Error(`${path.basename(filePath)}: formato inválido (necesita 2 separadores ---)`);
  }

  const frontmatter = parts[1].trim();
  const rest = parts.slice(2).join("---").trim();

  const getField = (key) => {
    const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return match ? match[1].trim() : null;
  };

  const paraRaw = getField("Para");
  const empresa = getField("Empresa");
  const emailMatch = paraRaw.match(/[\w.+-]+@[\w.-]+\.\w+/);
  if (!emailMatch) throw new Error(`${path.basename(filePath)}: no email en Para: ${paraRaw}`);
  const to = emailMatch[0];

  const betreffMatch = rest.match(/^Betreff:\s*(.+)$/m);
  if (!betreffMatch) throw new Error(`${path.basename(filePath)}: falta Betreff:`);
  const betreff = betreffMatch[1].trim();

  const bodyStart = rest.indexOf(betreffMatch[0]) + betreffMatch[0].length;
  const body = rest.slice(bodyStart).trim();

  return { to, empresa, betreff, body };
}

function injectUtm(body, empresa) {
  const utmLink = buildUtmLink(empresa);
  return body.replace(/(https?:\/\/)?quetz\.org\/empresas(?:\?[^\s)]+)?/g, utmLink);
}

async function sendViaResend(to, betreff, textBody) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY no configurada");

  const payload = JSON.stringify({
    from: FROM,
    to: [to],
    reply_to: REPLY_TO,
    subject: betreff,
    text: textBody,
  });

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
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Resend ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function notifyTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[telegram] Credenciales no configuradas — saltando");
    return;
  }
  const payload = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "HTML",
  });
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
    req.on("error", (e) => { console.warn("[telegram] Error:", e.message); resolve(); });
    req.write(payload);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── State helpers ─────────────────────────────────────────────────────────────

function loadSentLog() {
  try { return JSON.parse(fs.readFileSync(SENT_LOG, "utf8")); } catch { return {}; }
}
function saveSentLog(log) {
  fs.writeFileSync(SENT_LOG, JSON.stringify(log, null, 2));
}
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch {
    return { status: "idle", started_at: null, finished_at: null, current_run: [], errors: [], history: [] };
  }
}
function saveState(state) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } catch { /* ignore */ }
}

// ── Queue helpers ─────────────────────────────────────────────────────────────

function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) throw new Error(`queue.json no encontrado: ${QUEUE_FILE}`);
  return JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
}

function getNextBatch(queue, state) {
  const sentEmpresas = new Set((state.history || []).flatMap((r) => r.sent || []));
  const pending = queue.emails.filter((e) => !sentEmpresas.has(e.empresa));
  return pending.slice(0, queue.batch_size || BATCH_SIZE);
}

// ── Build email list ──────────────────────────────────────────────────────────

function buildEmailList() {
  if (QUEUE_MODE) {
    const queue = loadQueue();
    const state = loadState();
    const batch = getNextBatch(queue, state);
    if (batch.length === 0) return [];
    return batch.map((entry) => {
      const filePath = path.join(EMAILS_DIR, entry.file);
      const parsed = parseEmailFile(filePath);
      return { ...parsed, file: entry.file };
    });
  }

  // Default: all EMAIL-*.md files sorted
  return fs
    .readdirSync(EMAILS_DIR)
    .filter((f) => f.startsWith("EMAIL-") && f.endsWith(".md"))
    .sort()
    .map((f) => {
      const parsed = parseEmailFile(path.join(EMAILS_DIR, f));
      return { ...parsed, file: f };
    });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Cold Email Batch — ${startedAt}`);
  console.log(DRY_RUN ? "MODE: DRY RUN" : QUEUE_MODE ? "MODE: QUEUE" : "MODE: DIRECT");
  console.log("=".repeat(60));

  // Build email list
  let emails;
  try {
    emails = buildEmailList();
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }

  if (emails.length === 0) {
    const msg = "⚠️ Queue vacía — agregar más empresas a queue.json";
    console.log(`\n${msg}\n`);
    if (!DRY_RUN) await notifyTelegram(msg);
    process.exit(0);
  }

  // Update state: running
  if (!DRY_RUN) {
    saveState({ ...loadState(), status: "running", started_at: startedAt, current_run: [], errors: [] });
  }

  // Anti-duplicate (skip in dry-run)
  const today = todayKey();
  const sentLog = loadSentLog();
  if (!DRY_RUN && sentLog[today]) {
    console.error(`\n🛑 ABORTADO — Ya enviados hoy ${today}: ${sentLog[today].join(", ")}`);
    console.error(`Para re-enviar: rm ${SENT_LOG}`);
    process.exit(1);
  }

  // Preview
  console.log(`\n${emails.length} emails:\n`);
  emails.forEach((e, i) => {
    console.log(`[${i + 1}] ${e.empresa}`);
    console.log(`    To:      ${e.to}`);
    console.log(`    Betreff: ${e.betreff}`);
    console.log(`    UTM:     ${buildUtmLink(e.empresa)}`);
    console.log();
  });

  if (DRY_RUN) {
    console.log("── DRY RUN COMPLETO — nada enviado ──\n");
    emails.forEach((e) => {
      console.log(`${"─".repeat(50)}\n[${e.empresa}]\n${"─".repeat(50)}`);
      console.log(injectUtm(e.body, e.empresa));
      console.log();
    });
    return;
  }

  // Send loop
  const results = [];
  const sentToday = [];

  for (let i = 0; i < emails.length; i++) {
    const e = emails[i];
    const bodyWithUtm = injectUtm(e.body, e.empresa);
    const hora = new Date().toLocaleTimeString("de-DE", {
      timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit",
    });

    if (i > 0) {
      console.log(`\n⏳ Esperando 10 min...`);
      await sleep(INTERVAL_MS);
    }

    console.log(`\n[${i + 1}/${emails.length}] → ${e.empresa} <${e.to}>`);

    try {
      const res = await sendViaResend(e.to, e.betreff, bodyWithUtm);
      console.log(`  ✅ OK — ${res.id}`);
      results.push({ empresa: e.empresa, status: "ok", id: res.id, sent_at: new Date().toISOString() });
      sentToday.push(e.empresa);

      // Update running state
      const state = loadState();
      state.current_run = results;
      saveState(state);

      await notifyTelegram(`📤 Cold email enviado\n<b>${e.empresa}</b>\n${e.betreff}\n🕐 ${hora} CET`);
    } catch (err) {
      console.error(`  ❌ FALLO — ${err.message}`);
      results.push({ empresa: e.empresa, status: "error", error: err.message, sent_at: new Date().toISOString() });
      await notifyTelegram(`❌ Cold email FALLIDO\n<b>${e.empresa}</b>\n${err.message}\n🕐 ${hora} CET`);
    }
  }

  // Persist sent log (anti-dup)
  if (sentToday.length > 0) {
    sentLog[today] = sentToday;
    saveSentLog(sentLog);
  }

  // Persist final state
  const finishedAt = new Date().toISOString();
  const prevState = loadState();
  const historyEntry = { date: today, started_at: startedAt, finished_at: finishedAt, sent: sentToday, results };
  saveState({
    ...prevState,
    status: "idle",
    started_at: startedAt,
    finished_at: finishedAt,
    current_run: results,
    errors: results.filter((r) => r.status === "error").map((r) => r.error),
    history: [...(prevState.history || []), historyEntry],
  });

  // Telegram summary
  const lines = results.map((r) => `${r.status === "ok" ? "✅" : "❌"} ${r.empresa}`);
  const summary = `📊 Cold batch completado\n${lines.join("\n")}\n${sentToday.length}/${emails.length} enviados`;
  console.log(`\n${summary}`);
  await notifyTelegram(summary);
}

main().catch((err) => {
  console.error("\n💥 Error inesperado:", err);
  saveState({ ...loadState(), status: "error", errors: [err.message] });
  process.exit(1);
});
