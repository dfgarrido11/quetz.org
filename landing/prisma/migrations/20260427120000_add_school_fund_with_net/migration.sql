-- AlterTable: add school fund tracking fields to Adoption
ALTER TABLE "Adoption" ADD COLUMN "grossEur" DOUBLE PRECISION;
ALTER TABLE "Adoption" ADD COLUMN "stripeFeeEur" DOUBLE PRECISION;
ALTER TABLE "Adoption" ADD COLUMN "netEur" DOUBLE PRECISION;
ALTER TABLE "Adoption" ADD COLUMN "schoolFundEur" DOUBLE PRECISION;
ALTER TABLE "Adoption" ADD COLUMN "stripeFeeEstimated" BOOLEAN NOT NULL DEFAULT false;
