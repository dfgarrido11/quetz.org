/**
 * instagram-cron.mjs
 *
 * Railway Cron Job script — calls the /api/instagram/post endpoint.
 * This script runs as a standalone Node.js process triggered by Railway's cron scheduler.
 *
 * Railway Cron Schedule (UTC):
 *   0 7 * * 1,3,5,0
 *   → Every Monday, Wednesday, Friday, Sunday at 07:00 UTC
 *   → = 09:00 CET (UTC+2 in summer) / 08:00 CET (UTC+1 in winter)
 *
 * Environment variables required:
 *   - APP_URL        → e.g. https://quetz.org
 *   - CRON_SECRET    → same value as in the Next.js app
 */

const APP_URL = process.env.APP_URL || 'https://quetz.org';
const CRON_SECRET = process.env.CRON_SECRET || 'quetz-cron-secret-2024';

async function run() {
  const endpoint = `${APP_URL}/api/instagram/post`;
  console.log(`[${new Date().toISOString()}] Calling Instagram post endpoint: ${endpoint}`);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: CRON_SECRET }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[ERROR] Status ${res.status}:`, data);
      process.exit(1);
    }

    console.log(`[SUCCESS] Post published!`, data);
    process.exit(0);
  } catch (err) {
    console.error('[FATAL] Failed to call endpoint:', err);
    process.exit(1);
  }
}

run();
