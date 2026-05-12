-- AlterTable: add b2b flag and billingInterval to Subscription
ALTER TABLE "Subscription" ADD COLUMN "b2b" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscription" ADD COLUMN "billingInterval" TEXT;
