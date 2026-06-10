import { describe, expect, test } from 'vitest';

import { getReportHistoryGroupsViewModel } from './reportSelectors';

import type { ListReportAnalysesApiResponse } from './reportApi';

type ReportHistoryItem = ListReportAnalysesApiResponse['items'][number];

const createHistoryItem = (overrides: Partial<ReportHistoryItem> = {}): ReportHistoryItem => ({
  createdAt: '2026-06-09T00:00:00.000Z',
  branch: 'main',
  id: 'analysis-id',
  latestCommitDate: '2026-06-09T00:00:00.000Z',
  latestCommitSha: 'abc123',
  latestCommitTitle: 'Add frontend radar dashboard',
  normalizedUrl: 'https://github.com/evolutioncpp/frontend-radar',
  owner: 'evolutioncpp',
  projectPath: null,
  repository: 'frontend-radar',
  status: 'completed',
  updatedAt: '2026-06-09T00:00:00.000Z',
  ...overrides,
});

describe('reportSelectors', () => {
  test('groups repeated runs by repository and project path', () => {
    const groups = getReportHistoryGroupsViewModel(
      [
        createHistoryItem({
          id: 'older',
          projectPath: 'apps/web',
          updatedAt: '2026-06-09T00:01:00.000Z',
        }),
        createHistoryItem({
          id: 'newer',
          projectPath: 'apps/web',
          updatedAt: '2026-06-09T00:02:00.000Z',
        }),
      ],
      'en',
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.latestRun.id).toBe('newer');
    expect(groups[0]?.latestRun.activityLabel).toMatch(/\d{1,2}:\d{2}/);
    expect(groups[0]?.latestRun.commitTitle).toBe('Add frontend radar dashboard');
    expect(groups[0]?.previousRuns.map((run) => run.id)).toEqual(['older']);
    expect(groups[0]?.previousRuns[0]?.activityLabel).toMatch(/\d{1,2}:\d{2}/);
    expect(groups[0]?.runCount).toBe(2);
  });

  test('keeps different project paths in separate groups', () => {
    const groups = getReportHistoryGroupsViewModel(
      [
        createHistoryItem({
          id: 'web',
          projectPath: 'apps/web',
        }),
        createHistoryItem({
          id: 'docs',
          projectPath: 'apps/docs',
        }),
      ],
      'en',
    );

    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.projectPath)).toEqual(['apps/web', 'apps/docs']);
  });

  test('keeps different branches in separate groups', () => {
    const groups = getReportHistoryGroupsViewModel(
      [
        createHistoryItem({
          branch: 'main',
          id: 'main',
          projectPath: 'apps/web',
        }),
        createHistoryItem({
          branch: 'develop',
          id: 'develop',
          projectPath: 'apps/web',
        }),
      ],
      'en',
    );

    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.branch)).toEqual(['main', 'develop']);
  });

  test('treats null and empty project paths as the root group', () => {
    const groups = getReportHistoryGroupsViewModel(
      [
        createHistoryItem({
          id: 'null-path',
          projectPath: null,
          updatedAt: '2026-06-09T00:01:00.000Z',
        }),
        createHistoryItem({
          id: 'empty-path',
          projectPath: '',
          updatedAt: '2026-06-09T00:02:00.000Z',
        }),
      ],
      'en',
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.projectPath).toBeNull();
    expect(groups[0]?.latestRun.id).toBe('empty-path');
    expect(groups[0]?.previousRuns.map((run) => run.id)).toEqual(['null-path']);
  });

  test('sorts groups and runs by latest activity descending', () => {
    const groups = getReportHistoryGroupsViewModel(
      [
        createHistoryItem({
          id: 'repo-a-older',
          repository: 'repo-a',
          updatedAt: '2026-06-09T00:01:00.000Z',
        }),
        createHistoryItem({
          id: 'repo-b-latest',
          repository: 'repo-b',
          updatedAt: '2026-06-09T00:04:00.000Z',
        }),
        createHistoryItem({
          id: 'repo-a-newer',
          repository: 'repo-a',
          updatedAt: '2026-06-09T00:03:00.000Z',
        }),
      ],
      'en',
    );

    expect(groups.map((group) => group.latestRun.id)).toEqual(['repo-b-latest', 'repo-a-newer']);
    expect(groups[1]?.previousRuns.map((run) => run.id)).toEqual(['repo-a-older']);
  });
});
