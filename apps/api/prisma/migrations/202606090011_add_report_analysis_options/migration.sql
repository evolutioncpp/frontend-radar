ALTER TYPE "ReportAnalysisProgressStage" ADD VALUE IF NOT EXISTS 'workflow_analysis';

ALTER TABLE "ReportAnalysis"
  ADD COLUMN IF NOT EXISTS "isHistoryVisible" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "scoreCategoriesKey" TEXT NOT NULL DEFAULT 'documentation,testing,ci,dependencies,maintainability,performance,accessibility';

DROP INDEX IF EXISTS "ReportAnalysis_dedupe_branch_key";
DROP INDEX IF EXISTS "ReportAnalysis_history_branch_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "ReportAnalysis_dedupe_options_key"
  ON "ReportAnalysis" (
    "repositoryKey",
    "projectPath",
    "branch",
    "snapshotKey",
    "analysisVersion",
    "scoreCategoriesKey",
    "isHistoryVisible"
  );

CREATE INDEX IF NOT EXISTS "ReportAnalysis_history_options_idx"
  ON "ReportAnalysis" (
    "isHistoryVisible",
    "repositoryKey",
    "projectPath",
    "branch",
    "status",
    "updatedAt"
  );

