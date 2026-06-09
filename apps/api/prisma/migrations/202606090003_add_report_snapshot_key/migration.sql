ALTER TABLE "ReportAnalysis"
ADD COLUMN "snapshotKey" TEXT;

UPDATE "ReportAnalysis"
SET "snapshotKey" = CASE
  WHEN "latestCommitSha" IS NOT NULL THEN 'sha:' || "latestCommitSha"
  WHEN "latestCommitDate" IS NOT NULL THEN 'date:' || "latestCommitDate"
  ELSE 'unknown'
END
WHERE "snapshotKey" IS NULL;

ALTER TABLE "ReportAnalysis"
ALTER COLUMN "snapshotKey" SET NOT NULL;

DELETE FROM "ReportAnalysis"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "repositoryKey", "snapshotKey", "analysisVersion"
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

DROP INDEX "ReportAnalysis_repositoryKey_latestCommitSha_analysisVersion_key";

CREATE UNIQUE INDEX "ReportAnalysis_repositoryKey_snapshotKey_analysisVersion_key"
ON "ReportAnalysis"("repositoryKey", "snapshotKey", "analysisVersion");
