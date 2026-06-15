import { expect, type Page } from '@playwright/test';

import { createE2eHistoryResponse, createE2eProjectReport } from './projectReport';

import type { ProjectReport } from '../../src/entities/report';

export const e2eAnalysisId = 'analysis-id';

export const mockCompletedReport = async (
  page: Page,
  report: ProjectReport = createE2eProjectReport(),
) => {
  await page.route(`**/reports/${e2eAnalysisId}`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        id: e2eAnalysisId,
        report,
        status: 'completed',
      },
    });
  });

  await page.route(`**/reports/${e2eAnalysisId}/comparison**`, async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        status: 'unavailable',
      },
    });
  });
};

export const mockHistory = async (page: Page) => {
  await page.route('**/reports', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: createE2eHistoryResponse(),
    });
  });
};

export const mockCreateReportAnalysis = async (page: Page) => {
  await page.route('**/reports/analyze', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject({
      enabledScoreCategories: expect.arrayContaining(['documentation', 'security', 'testing']),
      normalizedUrl: 'https://github.com/evolutioncpp/frontend-radar',
      owner: 'evolutioncpp',
      repository: 'frontend-radar',
      saveToHistory: true,
    });

    await route.fulfill({
      contentType: 'application/json',
      json: {
        id: e2eAnalysisId,
        reuseReason: null,
        status: 'completed',
      },
    });
  });
};
