import { expect, test } from '@playwright/test';

const testReport = {
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
    latestCommitSha: 'abc123',
    latestCommitDate: '2026-06-09T00:00:00.000Z',
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
  recommendations: [
    {
      id: 'add-ci',
      severity: 'medium',
      title: 'Add CI',
      description: 'Run automated checks for each change.',
    },
  ],
};

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

  await page.goto('/dashboard/report/analysis-id');

  await expect(
    page.getByRole('heading', { name: /Frontend project health overview/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /evolutioncpp\/frontend-radar/i })).toBeVisible();
  await expect(page.getByText(/Frontend Health Score/i)).toBeVisible();
  await expect(page.getByLabel('Score breakdown')).toBeVisible();
  await expect(page.getByLabel('Project checks list')).toBeVisible();
  await expect(page.getByLabel('Recommendations list')).toBeVisible();
});
