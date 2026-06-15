-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ReportAnalysisStatus" AS ENUM ('queued', 'running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "ReportProjectPathSource" AS ENUM ('autodetect', 'url', 'manual');

-- CreateEnum
CREATE TYPE "ReportAnalysisProgressStage" AS ENUM ('queued', 'starting', 'repository_metadata', 'project_detection', 'repository_signals', 'source_scan', 'security_scan', 'workflow_analysis', 'scoring', 'report_building');

-- CreateTable
CREATE TABLE "ReportAnalysis" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "repositoryKey" TEXT NOT NULL,
    "branch" TEXT NOT NULL DEFAULT '',
    "projectPath" TEXT NOT NULL DEFAULT '',
    "projectPathSource" "ReportProjectPathSource" NOT NULL DEFAULT 'autodetect',
    "normalizedUrl" TEXT NOT NULL,
    "status" "ReportAnalysisStatus" NOT NULL DEFAULT 'queued',
    "snapshotKey" TEXT NOT NULL,
    "latestCommitSha" TEXT,
    "latestCommitDate" TEXT,
    "latestCommitTitle" TEXT,
    "analysisVersion" INTEGER NOT NULL DEFAULT 1,
    "report" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "progressStage" "ReportAnalysisProgressStage" NOT NULL DEFAULT 'queued',
    "progressUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isHistoryVisible" BOOLEAN NOT NULL DEFAULT true,
    "scoreCategoriesKey" TEXT NOT NULL DEFAULT 'documentation,testing,ci,dependencies,security,maintainability,performance,accessibility',
    "leaseOwner" TEXT,
    "leaseExpiresAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportAnalysis_createdAt_idx" ON "ReportAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "ReportAnalysis_updatedAt_idx" ON "ReportAnalysis"("updatedAt");

-- CreateIndex
CREATE INDEX "ReportAnalysis_history_options_idx" ON "ReportAnalysis"("isHistoryVisible", "repositoryKey", "projectPath", "branch", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "ReportAnalysis_recovery_lease_idx" ON "ReportAnalysis"("status", "leaseExpiresAt", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReportAnalysis_dedupe_options_key" ON "ReportAnalysis"("repositoryKey", "projectPath", "branch", "snapshotKey", "analysisVersion", "scoreCategoriesKey", "isHistoryVisible");
