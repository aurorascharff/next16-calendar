import { expect, test } from '@playwright/test';

test.describe('Auth', () => {
  test('workspace routes redirect to login', async ({ page }) => {
    await page.goto('/calendar/2026-08-10');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('stale session redirects to login', async ({ context, page }) => {
    await context.addCookies([
      {
        domain: 'localhost',
        name: 'flow-user',
        path: '/',
        value: 'missing-user',
      },
    ]);

    await page.goto('/calendar/2026-08-10');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('signing in opens the calendar', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('flow-auth-e2e@example.com');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/calendar\/\d{4}-\d{2}-\d{2}$/, { timeout: 15_000 });
  });
});
