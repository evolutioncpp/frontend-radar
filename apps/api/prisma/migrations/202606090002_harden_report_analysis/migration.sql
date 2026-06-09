ALTER TYPE "ReportAnalysisStatus" ADD VALUE IF NOT EXISTS 'failed';

ALTER TABLE "ReportAnalysis"
ADD COLUMN "repositoryKey" TEXT,
ADD COLUMN "latestCommitSha" TEXT,
ADD COLUMN "latestCommitDate" TEXT,
ADD COLUMN "analysisVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "errorCode" TEXT,
ADD COLUMN "errorMessage" TEXT,
ADD COLUMN "startedAt" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3);

UPDATE "ReportAnalysis"
SET "repositoryKey" = LOWER("owner") || '/' || LOWER("repository")
WHERE "repositoryKey" IS NULL;

ALTER TABLE "ReportAnalysis"
ALTER COLUMN "repositoryKey" SET NOT NULL;

CREATE INDEX "ReportAnalysis_updatedAt_idx" ON "ReportAnalysis"("updatedAt");
CREATE INDEX "ReportAnalysis_repositoryKey_status_updatedAt_idx" ON "ReportAnalysis"("repositoryKey", "status", "updatedAt");
CREATE UNIQUE INDEX "ReportAnalysis_repositoryKey_latestCommitSha_analysisVersion_key" ON "ReportAnalysis"("repositoryKey", "latestCommitSha", "analysisVersion");
