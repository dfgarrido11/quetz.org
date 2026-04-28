-- Add GPS coordinates and human-readable plot area to Tree model
-- Brand narrative: "Jeder Baum hat einen Namen, eine Familie, einen Ort"

ALTER TABLE "Tree" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Tree" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "Tree" ADD COLUMN IF NOT EXISTS "plotArea" TEXT;
