-- Dedupe guard for social_queue.
--
-- Adds the columns needed to trace a row to its Postiz post and to reject the
-- same content going out twice on the same day.

ALTER TABLE "social_queue" ADD COLUMN "contentHash" TEXT;
ALTER TABLE "social_queue" ADD COLUMN "providerPostId" TEXT;
ALTER TABLE "social_queue" ADD COLUMN "publishedOn" TEXT;

-- Backfill existing rows so the NOT NULL below can be applied.
UPDATE "social_queue"
   SET "contentHash" = encode(sha256(convert_to("content", 'UTF8')), 'hex')
 WHERE "contentHash" IS NULL;

UPDATE "social_queue"
   SET "publishedOn" = to_char("publishedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD')
 WHERE "publishedAt" IS NOT NULL AND "publishedOn" IS NULL;

ALTER TABLE "social_queue" ALTER COLUMN "contentHash" SET NOT NULL;

CREATE INDEX "social_queue_contentHash_idx" ON "social_queue"("contentHash");

-- The actual guard. Partial, so that failed/queued rows can pile up freely
-- while a given piece of content can only reach published/scheduled once per
-- UTC day. A concurrent second publish hits this and raises P2002 instead of
-- creating a duplicate Instagram post.
CREATE UNIQUE INDEX "social_queue_dedupe_per_day"
    ON "social_queue"("contentHash", "publishedOn")
 WHERE "status" IN ('published', 'scheduled');
