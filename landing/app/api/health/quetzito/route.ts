export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

interface CheckResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
}

function withCheckTimeout(
  fn: () => Promise<CheckResult>,
  label: string,
  ms: number
): Promise<CheckResult> {
  return Promise.race([
    fn().catch(err => ({
      ok: false,
      latencyMs: 0,
      error: `${label}: ${String(err)}`,
    })),
    new Promise<CheckResult>(resolve =>
      setTimeout(
        () => resolve({ ok: false, latencyMs: ms, error: `${label} timed out after ${ms}ms` }),
        ms
      )
    ),
  ]);
}

async function checkAnthropic(): Promise<CheckResult> {
  const start = Date.now();
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10,
    messages: [{ role: 'user', content: 'ping' }],
  });
  return { ok: true, latencyMs: Date.now() - start };
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  return { ok: true, latencyMs: Date.now() - start };
}

async function checkTelegram(): Promise<CheckResult> {
  const start = Date.now();
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');
  const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  if (!res.ok) throw new Error(`Telegram getMe returned HTTP ${res.status}`);
  return { ok: true, latencyMs: Date.now() - start };
}

async function checkChatEndpoint(): Promise<CheckResult> {
  const start = Date.now();
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'hola' }],
      language: 'es',
      mascot: 'quetzito',
    }),
  });
  if (res.status >= 500) throw new Error(`/api/chat returned HTTP ${res.status}`);
  return { ok: true, latencyMs: Date.now() - start };
}

export async function GET() {
  const timestamp = new Date().toISOString();
  const PER_CHECK_TIMEOUT = 3500;
  const GLOBAL_TIMEOUT = 4500;

  const runChecks = () =>
    Promise.all([
      withCheckTimeout(checkAnthropic, 'anthropic', PER_CHECK_TIMEOUT),
      withCheckTimeout(checkDatabase, 'database', PER_CHECK_TIMEOUT),
      withCheckTimeout(checkTelegram, 'telegram', PER_CHECK_TIMEOUT),
      withCheckTimeout(checkChatEndpoint, 'chat', PER_CHECK_TIMEOUT),
    ]);

  const globalTimeoutPromise = new Promise<[CheckResult, CheckResult, CheckResult, CheckResult]>(
    resolve =>
      setTimeout(
        () =>
          resolve([
            { ok: false, latencyMs: GLOBAL_TIMEOUT, error: 'global timeout' },
            { ok: false, latencyMs: GLOBAL_TIMEOUT, error: 'global timeout' },
            { ok: false, latencyMs: GLOBAL_TIMEOUT, error: 'global timeout' },
            { ok: false, latencyMs: GLOBAL_TIMEOUT, error: 'global timeout' },
          ]),
        GLOBAL_TIMEOUT
      )
  );

  const [anthropic, database, telegram, chat] = await Promise.race([
    runChecks(),
    globalTimeoutPromise,
  ]);

  const checks = { anthropic, database, telegram, chat };
  const allOk = Object.values(checks).every(c => c.ok);

  console.log(
    JSON.stringify({
      event: 'quetzito_health_check',
      timestamp,
      status: allOk ? 'ok' : 'degraded',
      checks,
    })
  );

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp,
      checks,
    },
    {
      status: allOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
