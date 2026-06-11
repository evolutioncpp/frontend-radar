import { formatDateTime } from '@/shared/lib/format-date';

import type { ReportAnalysisStatus, ReportHistoryItem } from './types';

export interface ReportHistoryItemViewModel {
  activityAt: string;
  activityLabel: string;
  checksCount: number;
  branch: string;
  commitTitle: string | null;
  id: string;
  metricsCount: number;
  projectPath: string | null;
  recommendationsCount: number;
  repositoryName: string;
  score?: number;
  status: ReportAnalysisStatus;
}

export interface ReportHistoryGroupViewModel {
  id: string;
  latestRun: ReportHistoryItemViewModel;
  previousRuns: ReportHistoryItemViewModel[];
  branch: string;
  projectPath: string | null;
  repositoryName: string;
  runCount: number;
}

export const isReportProcessing = (status: ReportAnalysisStatus) => {
  return status === 'queued' || status === 'running';
};

export const isReportTerminal = (status: ReportAnalysisStatus) => {
  return status === 'completed' || status === 'failed';
};

const getHistoryGroupKey = (item: ReportHistoryItemViewModel) => {
  return `${item.repositoryName}::${item.branch}::${item.projectPath ?? 'root'}`;
};

const sortHistoryItems = (items: ReportHistoryItemViewModel[]) => {
  return [...items].sort(
    (left, right) => Date.parse(right.activityAt) - Date.parse(left.activityAt),
  );
};

const normalizeHistoryProjectPath = (projectPath?: string | null) => {
  const normalizedProjectPath = projectPath?.trim();

  return normalizedProjectPath ? normalizedProjectPath : null;
};

const normalizeCommitTitle = (title?: string | null) => {
  const normalizedTitle = title?.trim();

  return normalizedTitle ? normalizedTitle : null;
};

export const getReportHistoryItemViewModel = (
  item: ReportHistoryItem,
  language: string,
): ReportHistoryItemViewModel => {
  return {
    activityAt: item.updatedAt,
    activityLabel: formatDateTime(item.updatedAt, language),
    branch: item.branch,
    checksCount: item.checksCount ?? 0,
    commitTitle: normalizeCommitTitle(item.latestCommitTitle),
    id: item.id,
    metricsCount: item.metricsCount ?? 0,
    projectPath: normalizeHistoryProjectPath(item.projectPath),
    recommendationsCount: item.recommendationsCount ?? 0,
    repositoryName: `${item.owner}/${item.repository}`,
    score: item.score,
    status: item.status,
  };
};

export const getReportHistoryGroupsViewModel = (
  items: ReportHistoryItem[],
  language: string,
): ReportHistoryGroupViewModel[] => {
  const historyItems = sortHistoryItems(
    items.map((item) => getReportHistoryItemViewModel(item, language)),
  );
  const groupsByKey = new Map<string, ReportHistoryItemViewModel[]>();

  for (const item of historyItems) {
    const groupKey = getHistoryGroupKey(item);
    const groupItems = groupsByKey.get(groupKey) ?? [];

    groupItems.push(item);
    groupsByKey.set(groupKey, groupItems);
  }

  return [...groupsByKey.entries()]
    .flatMap(([id, groupItems]) => {
      const sortedGroupItems = sortHistoryItems(groupItems);
      const latestRun = sortedGroupItems[0];

      if (!latestRun) {
        return [];
      }

      return {
        id,
        branch: latestRun.branch,
        latestRun,
        previousRuns: sortedGroupItems.slice(1),
        projectPath: latestRun.projectPath,
        repositoryName: latestRun.repositoryName,
        runCount: groupItems.length,
      };
    })
    .sort(
      (left, right) =>
        Date.parse(right.latestRun.activityAt) - Date.parse(left.latestRun.activityAt),
    );
};
