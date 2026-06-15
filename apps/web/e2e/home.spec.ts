import { expect, test } from '@playwright/test';

test('opens dashboard overview from root page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Frontend Radar/i);
  await expect(
    page.getByRole('heading', { name: /Frontend project health overview/i }),
  ).toBeVisible();
});
