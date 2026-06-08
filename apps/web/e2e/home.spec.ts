import { expect, test } from '@playwright/test';

test('opens home page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Frontend Radar/i);
  await expect(page.getByRole('heading', { name: /Frontend Radar/i })).toBeVisible();
});
