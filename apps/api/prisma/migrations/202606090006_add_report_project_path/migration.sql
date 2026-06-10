ALTER TABLE "ReportAnalysis"
ADD COLUMN IF NOT EXISTS "projectPath" TEXT;

UPDATE "ReportAnalysis"
SET "projectPath" = ''
WHERE "projectPath" IS NULL;

ALTER TABLE "ReportAnalysis"
ALTER COLUMN "projectPath" SET DEFAULT '';

ALTER TABLE "ReportAnalysis"
ALTER COLUMN "projectPath" SET NOT NULL;

DELETE FROM "ReportAnalysis"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "repositoryKey", "projectPath", "snapshotKey", "analysisVersion"
        ORDER BY
          CASE "status"
            WHEN 'completed' THEN 0
            WHEN 'running' THEN 1
            WHEN 'queued' THEN 2
            ELSE 3
          END,
          "updatedAt" DESC,
          "createdAt" DESC
      ) AS "snapshotRank"
    FROM "ReportAnalysis"
  ) ranked
  WHERE "snapshotRank" > 1
);

DROP INDEX IF EXISTS "ReportAnalysis_repositoryKey_snapshotKey_analysisVersion_key";
DROP INDEX IF EXISTS "ReportAnalysis_repositoryKey_projectPath_snapshotKey_analys_key";

CREATE UNIQUE INDEX "ReportAnalysis_repositoryKey_projectPath_snapshotKey_analys_key"
ON "ReportAnalysis"("repositoryKey", "projectPath", "snapshotKey", "analysisVersion");

DROP INDEX IF EXISTS "ReportAnalysis_repositoryKey_status_updatedAt_idx";
DROP INDEX IF EXISTS "ReportAnalysis_repositoryKey_projectPath_status_updatedAt_idx";

CREATE INDEX "ReportAnalysis_repositoryKey_projectPath_status_updatedAt_idx"
ON "ReportAnalysis"("repositoryKey", "projectPath", "status", "updatedAt");
