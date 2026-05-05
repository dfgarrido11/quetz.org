-- Add photos array to Adoption for plantation photo gallery
ALTER TABLE "Adoption" ADD COLUMN IF NOT EXISTS "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
