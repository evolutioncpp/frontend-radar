CREATE TYPE "ReportAnalysisStatus" AS ENUM ('queued', 'running', 'completed');

CREATE TABLE "ReportAnalysis" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "status" "ReportAnalysisStatus" NOT NULL DEFAULT 'queued',
    "report" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReportAnalysis_createdAt_idx" ON "ReportAnalysis"("createdAt");
