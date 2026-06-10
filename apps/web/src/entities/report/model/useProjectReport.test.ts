import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useProjectReport } from './useProjectReport';

import type { ProjectReport } from './types';

const apiMocks = vi.hoisted(() => ({
  getReportAnalysis: vi.fn(),
}));

vi.mock('@/shared/api/generatedApi', () => ({
  useGetReportAnalysisQuery: (...args: unknown[]) => apiMocks.getReportAnalysis(...args),
}));

const testReport: ProjectReport = {
  id: 'analysis-id',
  createdAt: '2026-06-09T00:00:00.000Z',
  totalScore: 82,
  repository: {
    owner: 'evolutioncpp',
    name: 'frontend-radar',
    url: 'https://github.com/evolutioncpp/frontend-radar',
    description: 'Frontend dashboard',
    stars: 128,
    forks: 14,
    defaultBranch: 'main',
    projectPath: null,
    projectDetection: {
      source: 'autodetect',
      path: null,
      packageJsonPath: 'package.json',
      confidence: 'high',
      signals: [
        {
          id: 'project-package-json',
          label: 'Frontend package.json',
          status: 'found',
          source: 'package.json',
        },
      ],
    },
    latestCommitSha: 'abc123',
    latestCommitDate: '2026-06-09T00:00:00.000Z',
    latestCommitTitle: 'Add frontend dashboard',
    license: 'MIT',
  },
  scoreBreakdown: [
    {
      category: 'documentation',
      label: 'Documentation',
      value: 82,
      maxValue: 100,
      status: 'good',
      description: 'Documentation signals.',
      evidence: [
        {
          id: 'readme',
          label: 'README',
          status: 'found',
          source: 'README',
        },
      ],
    },
  ],
  checks: [
    {
      id: 'readme-exists',
      label: 'README exists',
      status: 'passed',
    },
  ],
  recommendations: [],
};

describe('useProjectReport', () => {
  beforeEach(() => {
    apiMocks.getReportAnalysis.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns ready state for completed report', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        report: testReport,
        status: 'completed',
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useProjectReport('analysis-id'));

    expect(result.current.status).toBe('ready');

    if (result.current.status === 'ready') {
      expect(result.current.report.repository.owner).toBe('evolutioncpp');
      expect(result.current.report.repository.name).toBe('frontend-radar');
    }
  });

  test('returns processing state for running report', () => {
    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        status: 'running',
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useProjectReport('analysis-id'));

    expect(result.current).toEqual({
      status: 'processing',
    });
  });

  test('polls while report is processing', () => {
    vi.useFakeTimers();
    const refetch = vi.fn();

    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        status: 'running',
      },
      isError: false,
      isLoading: false,
      refetch,
    });

    renderHook(() => useProjectReport('analysis-id'));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('returns failed state and stops polling for failed report', () => {
    vi.useFakeTimers();
    const refetch = vi.fn();

    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        status: 'failed',
        errorCode: 'github_unavailable',
        errorMessage: 'GitHub is unavailable right now. Try again later.',
      },
      isError: false,
      isLoading: false,
      refetch,
    });

    const { result } = renderHook(() => useProjectReport('analysis-id'));

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(result.current).toEqual({
      status: 'failed',
      errorCode: 'github_unavailable',
      errorMessage: 'GitHub is unavailable right now. Try again later.',
    });
    expect(refetch).not.toHaveBeenCalled();
  });

  test('does not poll after report returns not found', () => {
    vi.useFakeTimers();
    const refetch = vi.fn();

    apiMocks.getReportAnalysis.mockReturnValue({
      data: undefined,
      error: {
        status: 404,
      },
      isError: true,
      isLoading: false,
      refetch,
    });

    renderHook(() => useProjectReport('unknown'));

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(refetch).not.toHaveBeenCalled();
  });

  test('does not poll after report returns not found with stale processing data', () => {
    vi.useFakeTimers();
    const refetch = vi.fn();

    apiMocks.getReportAnalysis.mockReturnValue({
      data: {
        id: 'analysis-id',
        status: 'running',
      },
      error: {
        status: 404,
      },
      isError: true,
      isLoading: false,
      refetch,
    });

    renderHook(() => useProjectReport('analysis-id'));

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(refetch).not.toHaveBeenCalled();
  });

  test.each([undefined, '', 'unknown'])('returns notFound for %s report id', (reportId) => {
    if (reportId === 'unknown') {
      apiMocks.getReportAnalysis.mockReturnValue({
        error: {
          status: 404,
        },
        isError: true,
        isLoading: false,
        refetch: vi.fn(),
      });
    }

    const { result } = renderHook(() => useProjectReport(reportId));

    expect(result.current).toEqual({
      status: 'notFound',
    });
  });
});
