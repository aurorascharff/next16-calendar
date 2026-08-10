import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';

test.describe('Login page (/login)', () => {
  test('initial load exposes the sign-in shell immediately', async ({ baseURL, page }) => {
    await instant(
      page,
      async () => {
        await page.goto('/login');
        await expect(page.getByText('Flow')).toBeVisible();
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
      },
      { baseURL },
    );
  });
});
