ALTER TABLE "ReportAnalysis"
  ADD COLUMN IF NOT EXISTS "leaseOwner" TEXT,
  ADD COLUMN IF NOT EXISTS "leaseExpiresAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ReportAnalysis_recovery_lease_idx"
  ON "ReportAnalysis"("status", "leaseExpiresAt", "updatedAt");
