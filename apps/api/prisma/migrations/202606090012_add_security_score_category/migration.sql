ALTER TYPE "ReportAnalysisProgressStage" ADD VALUE IF NOT EXISTS 'security_scan';

ALTER TABLE "ReportAnalysis"
  ALTER COLUMN "scoreCategoriesKey" SET DEFAULT 'documentation,testing,ci,dependencies,security,maintainability,performance,accessibility';
