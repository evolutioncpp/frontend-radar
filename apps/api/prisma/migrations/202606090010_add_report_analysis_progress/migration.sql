DO $$
BEGIN
  CREATE TYPE "ReportAnalysisProgressStage" AS ENUM (
    'queued',
    'starting',
    'repository_metadata',
    'project_detection',
    'repository_signals',
    'source_scan',
    'scoring',
    'report_building'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "ReportAnalysis"
  ADD COLUMN IF NOT EXISTS "progressStage" "ReportAnalysisProgressStage" NOT NULL DEFAULT 'queued',
  ADD COLUMN IF NOT EXISTS "progressUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
