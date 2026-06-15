import { expect, test } from '@playwright/test';

import {
  e2eAnalysisId,
  mockCompletedReport,
  mockCreateReportAnalysis,
  mockHistory,
} from './fixtures/api';

test('opens dashboard analysis page', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /Frontend project health overview/i }),
  ).toBeVisible();

  await expect(page.getByRole('textbox', { name: /Repository/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Analyze/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /How the analysis works/i })).toBeVisible();
});

test('starts analysis and opens completed report page', async ({ page }) => {
  await mockCreateReportAnalysis(page);
  await mockCompletedReport(page);

  await page.goto('/');

  await page
    .getByRole('textbox', { name: /Repository/i })
    .fill('https://github.com/evolutioncpp/frontend-radar');
  await page.getByRole('button', { name: /Analyze/i }).click();

  await expect(page).toHaveURL(new RegExp(`/report/${e2eAnalysisId}$`, 'u'));
  await expect(page.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i })).toBeVisible();
  await expect(page.getByText(/Frontend Health Score/i)).toBeVisible();
  await expect(page.getByLabel('Score breakdown')).toBeVisible();
  await expect(page.getByLabel('Medium priority recommendations')).toBeVisible();
});

test('opens completed report page from direct URL', async ({ page }) => {
  await mockCompletedReport(page);

  await page.goto(`/report/${e2eAnalysisId}`);

  await expect(
    page.getByRole('heading', { name: /Frontend project health overview/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i })).toBeVisible();
  await expect(page.getByText(/Frontend Health Score/i)).toBeVisible();
  await expect(page.getByLabel('Score breakdown')).toBeVisible();
  await expect(page.getByLabel('Medium priority recommendations')).toBeVisible();
});

test('opens history page with previous runs', async ({ page }) => {
  await mockHistory(page);

  await page.goto('/history');

  await expect(page.getByRole('heading', { name: /^History$/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Show previous run/i })).toBeVisible();
});

test('opens settings page with report preferences', async ({ page }) => {
  await page.goto('/settings');

  await expect(page.getByRole('heading', { name: /Application settings/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /GitHub access/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Report preferences/i })).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: /Save analysis runs to history/i }),
  ).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /Security/i })).toBeChecked();
});
