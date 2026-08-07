-- CreateTable
CREATE TABLE "agent_email_log" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "messageId" TEXT,
    "fromUsed" TEXT,
    "error" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_email_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_queue" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'queued',
    "error" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_email_log_to_createdAt_idx" ON "agent_email_log"("to", "createdAt");

-- CreateIndex
CREATE INDEX "agent_email_log_createdAt_idx" ON "agent_email_log"("createdAt");

-- CreateIndex
CREATE INDEX "social_queue_status_createdAt_idx" ON "social_queue"("status", "createdAt");

