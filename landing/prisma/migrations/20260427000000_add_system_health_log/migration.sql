-- CreateTable
CREATE TABLE "SystemHealthLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "diagnosis" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "SystemHealthLog_pkey" PRIMARY KEY ("id")
);
