/**
 * GET /api/stats
 * Admin-facing live stats — same source as /api/transparency.
 * Add session auth here if this route becomes public-facing.
 */
export const dynamic = 'force-dynamic';

export { GET } from '@/app/api/transparency/route';
