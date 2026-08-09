import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';

test('public booking keeps its frame while an unknown profile resolves', async ({ baseURL, page }) => {
  await instant(
    page,
    async () => {
      await page.goto('/book/missing-profile');
      await expect(page.getByRole('link', { name: 'Flow' })).toBeVisible();
      await expect(page.getByText('The page you were looking for does not exist.')).toHaveCount(0);
    },
    { baseURL },
  );

  await expect(page.getByText('The page you were looking for does not exist.')).toBeVisible();
});
