DO $$
BEGIN
  CREATE TYPE "ReportProjectPathSource" AS ENUM ('autodetect', 'url', 'manual');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ReportAnalysis"
ADD COLUMN IF NOT EXISTS "projectPathSource" "ReportProjectPathSource";

UPDATE "ReportAnalysis"
SET "projectPathSource" = CASE
  WHEN COALESCE("projectPath", '') = '' THEN 'autodetect'::"ReportProjectPathSource"
  ELSE 'manual'::"ReportProjectPathSource"
END
WHERE "projectPathSource" IS NULL;

ALTER TABLE "ReportAnalysis"
ALTER COLUMN "projectPathSource" SET DEFAULT 'autodetect';

ALTER TABLE "ReportAnalysis"
ALTER COLUMN "projectPathSource" SET NOT NULL;
