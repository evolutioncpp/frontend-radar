import { expect, test } from '@playwright/test';

import { createE2eProjectReport } from './fixtures/projectReport';

test('opens dashboard analysis page', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(
    page.getByRole('heading', { name: /Frontend project health overview/i }),
  ).toBeVisible();

  await expect(page.getByRole('textbox', { name: /Repository/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Analyze/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /How the analysis works/i })).toBeVisible();
});

test('opens completed report page', async ({ page }) => {
  const testReport = createE2eProjectReport();

  await page.route('**/reports/analysis-id', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        id: 'analysis-id',
        report: testReport,
        status: 'completed',
      },
    });
  });
  await page.route('**/reports/analysis-id/comparison**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        status: 'unavailable',
      },
    });
  });

  await page.goto('/dashboard/report/analysis-id');

  await expect(
    page.getByRole('heading', { name: /Frontend project health overview/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i })).toBeVisible();
  await expect(page.getByText(/Frontend Health Score/i)).toBeVisible();
  await expect(page.getByLabel('Score breakdown')).toBeVisible();
  await expect(page.getByLabel('Medium priority recommendations')).toBeVisible();
});
