import { expect, test } from '@playwright/test';

test('opens dashboard analysis page', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(
    page.getByRole('heading', { name: /Frontend project health overview/i }),
  ).toBeVisible();

  await expect(page.getByRole('textbox', { name: /Repository/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Analyze/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /How the analysis works/i })).toBeVisible();
});

test('opens demo report page', async ({ page }) => {
  await page.goto('/dashboard/report/demo');

  await expect(
    page.getByRole('heading', { name: /Frontend project health overview/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i })).toBeVisible();
  await expect(page.getByText(/Frontend Health Score/i)).toBeVisible();
  await expect(page.getByLabel('Score breakdown')).toBeVisible();
  await expect(page.getByLabel('Project checks list')).toBeVisible();
  await expect(page.getByLabel('Recommendations list')).toBeVisible();
});
