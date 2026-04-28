-- Add stripeSessionId to Adoption for webhook idempotency
ALTER TABLE "Adoption" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Adoption_stripeSessionId_key" ON "Adoption"("stripeSessionId");
