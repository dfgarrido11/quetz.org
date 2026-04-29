/**
 * Backfill: Recover Adoption/Subscription records missing from DB
 * for Stripe checkout sessions that were paid but not persisted.
 *
 * Usage:
 *   npx tsx scripts/backfill-stripe-adoptions.ts --dry-run   (safe, no DB writes)
 *   npx tsx scripts/backfill-stripe-adoptions.ts             (writes to DB)
 *
 * Requires: STRIPE_SECRET_KEY set in env (or .env)
 */

import 'dotenv/config';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const DRY_RUN = process.argv.includes('--dry-run');
const DAYS_BACK = 30;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const prisma = new PrismaClient();

function log(msg: string) { console.log(`[backfill] ${msg}`); }
function warn(msg: string) { console.warn(`[backfill][WARN] ${msg}`); }
function err(msg: string) { console.error(`[backfill][ERROR] ${msg}`); }

async function findOrCreateUser(email: string, name: string): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing.id;
  if (DRY_RUN) return `[dry-run-user-${email}]`;
  const user = await prisma.user.create({ data: { email, name: name || null } });
  log(`  → User created: ${user.id} (${email})`);
  return user.id;
}

type DbTree = { id: string; species: string; nameEs: string; nameDe: string | null; nameEn: string | null };

async function loadAllTrees(): Promise<DbTree[]> {
  return prisma.tree.findMany({ select: { id: true, species: true, nameEs: true, nameDe: true, nameEn: true } });
}

function resolveTreeFromDescription(description: string, allTrees: DbTree[]): string | null {
  const desc = description.toLowerCase();
  // Exact species match first
  for (const t of allTrees) {
    if (desc.includes(t.species.toLowerCase())) return t.id;
  }
  // Fuzzy match on multilingual names
  for (const t of allTrees) {
    const names = [t.nameEs, t.nameDe, t.nameEn].filter(Boolean) as string[];
    if (names.some((n) => desc.includes(n.toLowerCase()))) return t.id;
  }
  return null;
}

async function resolveTreeId(planId?: string): Promise<string | null> {
  if (planId) {
    const tree = await prisma.tree.findUnique({ where: { species: planId } });
    if (tree) return tree.id;
    // Try partial match (e.g. "cacao" → "madre_cacao")
    const fuzzy = await prisma.tree.findFirst({ where: { species: { contains: planId } } });
    if (fuzzy) return fuzzy.id;
  }
  const fallback = await prisma.tree.findFirst({ where: { active: true } });
  return fallback?.id ?? null;
}

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    err('STRIPE_SECRET_KEY is not set. Run with STRIPE_SECRET_KEY=sk_live_xxx npx tsx ...');
    process.exit(1);
  }

  log(DRY_RUN ? '=== DRY-RUN mode — no DB writes ===' : '=== LIVE mode — will write to DB ===');
  log(`Fetching completed Stripe checkout sessions from last ${DAYS_BACK} days...`);

  const since = Math.floor(Date.now() / 1000) - DAYS_BACK * 86400;

  // Paginate through all sessions
  const sessions: Stripe.Checkout.Session[] = [];
  for await (const session of stripe.checkout.sessions.list({
    limit: 100,
    created: { gte: since },
  })) {
    if (session.status === 'complete' && session.payment_status === 'paid') {
      sessions.push(session);
    }
  }

  log(`Found ${sessions.length} completed paid sessions to evaluate.`);

  const allTrees = await loadAllTrees();
  log(`Loaded ${allTrees.length} trees for description matching.`);

  let created = 0, skipped = 0, errors = 0;

  for (const session of sessions) {
    const id = session.id;
    const metadata = session.metadata ?? {};
    const isGift = metadata.isGift === 'true';
    const customerEmail = session.customer_email ?? session.customer_details?.email ?? '';
    const customerName = session.customer_details?.name ?? '';
    const amount = session.amount_total != null ? session.amount_total / 100 : 0;
    const currency = (session.currency ?? 'eur').toUpperCase();
    const planId = metadata.planId || metadata.treeId;
    const planName = metadata.planName || 'Tree Adoption';
    const qty = Math.max(1, parseInt(metadata.quantity || '1', 10) || 1);

    // ── GIFT: skip, handled by separate flow ────────────────────────────────
    if (isGift) {
      log(`SKIPPED  [gift]     ${id} — ${customerEmail}`);
      skipped++;
      continue;
    }

    if (!customerEmail) {
      warn(`SKIPPED  [no-email] ${id} — no customer email in session`);
      skipped++;
      continue;
    }

    // ── SUBSCRIPTION ────────────────────────────────────────────────────────
    if (session.mode === 'subscription' && session.subscription) {
      const stripeSubId = String(session.subscription);

      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: stripeSubId },
      });

      if (existing) {
        log(`SKIPPED  [sub-exists] ${id} — sub ${stripeSubId} already in DB`);
        skipped++;
        continue;
      }

      log(`CREATING [subscription] ${id} — ${customerEmail} — €${amount} — sub ${stripeSubId}`);
      if (!DRY_RUN) {
        try {
          const userId = await findOrCreateUser(customerEmail, customerName);
          const parsedTrees = parseInt(metadata.treesPerMonth || '1', 10);
          await prisma.subscription.create({
            data: {
              userId,
              planId: planId || 'cafe',
              planName,
              treesPerMonth: Number.isFinite(parsedTrees) ? parsedTrees : 1,
              priceEurMonth: amount,
              stripeSubscriptionId: stripeSubId,
              status: 'active',
            },
          });
          log(`  → Subscription created for ${stripeSubId}`);
          created++;
        } catch (e: any) {
          err(`  → Failed to create subscription for ${id}: ${e.message} (code: ${e.code})`);
          errors++;
        }
      } else {
        log(`  → [dry-run] Would create Subscription: planId=${planId || 'cafe'} amount=${amount} sub=${stripeSubId}`);
        created++;
      }
      continue;
    }

    // ── ONE-TIME ADOPTION (per line item) ───────────────────────────────────
    // Check if already processed (legacy: bare session ID or suffixed _0)
    const legacyCheck = await prisma.adoption.findFirst({
      where: {
        stripeSessionId: { in: [id, `${id}_0`] },
      },
    });
    if (legacyCheck) {
      log(`SKIPPED  [adoption-exists] ${id} — already in DB (stripeSessionId=${legacyCheck.stripeSessionId})`);
      skipped++;
      continue;
    }

    // Fetch line items from Stripe
    let lineItems: Stripe.LineItem[] = [];
    try {
      const li = await stripe.checkout.sessions.listLineItems(id, { limit: 100 });
      lineItems = li.data;
    } catch (e: any) {
      warn(`Could not fetch line items for ${id}: ${e.message} — falling back to metadata`);
    }

    // Fallback: treat as a single line item using session-level metadata
    if (lineItems.length === 0) {
      lineItems = [{
        id: 'fallback',
        object: 'item',
        amount_total: session.amount_total ?? 0,
        currency: session.currency ?? 'eur',
        description: planName,
        quantity: qty,
      } as unknown as Stripe.LineItem];
    }

    log(`PROCESSING [adoption] ${id} — ${customerEmail} — ${lineItems.length} line item(s)`);

    const userId = await findOrCreateUser(customerEmail, customerName);

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      const itemStripeId = `${id}_${i}`;
      const itemDescription = item.description ?? planName;
      const itemQty = item.quantity ?? 1;
      const itemAmount = item.amount_total != null ? item.amount_total / 100 : amount / lineItems.length;

      // Resolve tree: description match first, then metadata planId fallback
      let itemTreeId = resolveTreeFromDescription(itemDescription, allTrees);
      if (!itemTreeId) {
        itemTreeId = await resolveTreeId(planId);
      }

      log(`  [${i}] stripeSessionId=${itemStripeId} desc="${itemDescription}" qty=${itemQty} amount=${itemAmount} treeId=${itemTreeId ?? 'none'}`);

      if (!DRY_RUN) {
        try {
          const adoption = await prisma.adoption.create({
            data: {
              userId,
              treeId: itemTreeId,
              quantity: itemQty,
              amount: itemAmount,
              currency,
              status: 'active',
              stripeSessionId: itemStripeId,
            },
          });
          log(`  → Adoption created: ${adoption.id}`);
          created++;
        } catch (e: any) {
          err(`  → Failed to create adoption ${itemStripeId}: ${e.message} (code: ${e.code})`);
          errors++;
        }
      } else {
        log(`  → [dry-run] Would create Adoption: treeId=${itemTreeId ?? 'fallback'} qty=${itemQty} amount=${itemAmount}`);
        created++;
      }
    }
  }

  console.log('');
  log('=== SUMMARY ===');
  log(`Sessions evaluated : ${sessions.length}`);
  log(`Would create/Created: ${created}`);
  log(`Skipped            : ${skipped}`);
  log(`Errors             : ${errors}`);
  if (DRY_RUN) log('Run without --dry-run to apply changes.');
}

main()
  .catch((e) => { err(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
