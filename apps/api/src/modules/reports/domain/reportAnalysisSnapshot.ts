export interface ReportAnalysisSnapshotFields {
  latestCommitDate: string | null;
  latestCommitSha: string | null;
}

export const createReportAnalysisSnapshotKey = ({
  latestCommitDate,
  latestCommitSha,
}: ReportAnalysisSnapshotFields) => {
  if (latestCommitSha) {
    return `sha:${latestCommitSha}`;
  }

  if (latestCommitDate) {
    return `date:${latestCommitDate}`;
  }

  return 'unknown';
};
