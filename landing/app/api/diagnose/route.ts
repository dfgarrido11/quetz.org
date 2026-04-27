export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

interface DiagnosePayload {
  failure_type: string;
  logs_excerpt: string;
  timestamp: string;
}

async function sendTelegramAlert(text: string): Promise<void> {
  const token = process.env.TELEGRAM_ALERT_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ALERT_CHAT_ID;
  if (!token || !chatId) {
    console.warn('TELEGRAM_ALERT_BOT_TOKEN or TELEGRAM_ALERT_CHAT_ID not set — skipping alert');
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('Telegram alert failed:', res.status, body);
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-diagnose-secret');
  if (!secret || secret !== process.env.HEALTH_CHECK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.HAIKU_DIAGNOSE_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Diagnosis disabled' }, { status: 503 });
  }

  let payload: DiagnosePayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { failure_type, logs_excerpt, timestamp } = payload;

  const SYSTEM_PROMPT = `Du bist der Debugger für das Quetzito chatbot bei quetz.org.
Lies diese Logs und antworte auf Deutsch in max 150 Wörtern:
(1) Was ist passiert?
(2) Wahrscheinliche Ursache?
(3) Empfohlene Aktion?
Sei präzise und technisch.`;

  const userMessage = `Fehlertyp: ${failure_type}
Zeitpunkt: ${timestamp}

Logs:
${logs_excerpt}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let diagnosis = '';
  let dbLogId = '';

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create(
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      },
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    diagnosis = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    const alertText =
      `🚨 <b>Quetzito Diagnose</b>\n\n` +
      `<b>Fehlertyp:</b> ${failure_type}\n` +
      `<b>Zeit:</b> ${timestamp}\n\n` +
      `<b>Diagnose:</b>\n${diagnosis}`;

    await sendTelegramAlert(alertText);

    const logEntry = await prisma.systemHealthLog.create({
      data: {
        checkType: 'diagnosis',
        status: 'fail',
        errorMessage: `${failure_type}: ${logs_excerpt.slice(0, 500)}`,
        diagnosis,
        metadata: { failure_type, timestamp },
      },
    });
    dbLogId = logEntry.id;

    console.log(
      JSON.stringify({
        event: 'quetzito_diagnosis_complete',
        logId: dbLogId,
        failure_type,
        timestamp,
        diagnosisLength: diagnosis.length,
      })
    );

    return NextResponse.json({ ok: true, diagnosis, logId: dbLogId });
  } catch (err) {
    clearTimeout(timeoutId);
    const errMsg = String(err);

    console.error(
      JSON.stringify({
        event: 'quetzito_diagnosis_error',
        failure_type,
        timestamp,
        error: errMsg,
      })
    );

    try {
      await prisma.systemHealthLog.create({
        data: {
          checkType: 'diagnosis',
          status: 'fail',
          errorMessage: errMsg,
          metadata: { failure_type, timestamp },
        },
      });
    } catch (dbErr) {
      console.error('DB write failed during diagnosis error handling:', String(dbErr));
    }

    return NextResponse.json({ error: 'Diagnosis failed', detail: errMsg }, { status: 500 });
  }
}
