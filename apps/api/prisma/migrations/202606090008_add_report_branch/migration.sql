ALTER TABLE "ReportAnalysis"
ADD COLUMN IF NOT EXISTS "branch" TEXT;

UPDATE "ReportAnalysis"
SET "branch" = ''
WHERE "branch" IS NULL;

ALTER TABLE "ReportAnalysis"
ALTER COLUMN "branch" SET DEFAULT '',
ALTER COLUMN "branch" SET NOT NULL;

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "repositoryKey", "projectPath", "branch", "snapshotKey", "analysisVersion"
      ORDER BY
        CASE "status"
          WHEN 'completed' THEN 0
          WHEN 'running' THEN 1
          WHEN 'queued' THEN 2
          ELSE 3
        END,
        "updatedAt" DESC,
        "id" ASC
    ) AS "rank"
  FROM "ReportAnalysis"
)
DELETE FROM "ReportAnalysis"
WHERE "id" IN (
  SELECT "id"
  FROM ranked
  WHERE "rank" > 1
);

DROP INDEX IF EXISTS "ReportAnalysis_repositoryKey_projectPath_snapshotKey_analys_key";
DROP INDEX IF EXISTS "ReportAnalysis_repositoryKey_projectPath_status_updatedAt_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "ReportAnalysis_dedupe_branch_key"
ON "ReportAnalysis"("repositoryKey", "projectPath", "branch", "snapshotKey", "analysisVersion");

CREATE INDEX IF NOT EXISTS "ReportAnalysis_history_branch_idx"
ON "ReportAnalysis"("repositoryKey", "projectPath", "branch", "status", "updatedAt");
