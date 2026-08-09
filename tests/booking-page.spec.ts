import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Booking settings', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('initial load keeps the page structure visible', async ({ baseURL, page }) => {
    await instant(
      page,
      async () => {
        await page.goto('/booking');
        await expect(page.getByRole('heading', { name: 'Booking link', level: 1 })).toBeVisible();
        await expect(page.getByText('No booking link yet')).toHaveCount(0);
      },
      { baseURL },
    );

    await expect(page.getByText('No booking link yet')).toBeVisible();
  });

  test('client navigation reveals the page immediately', async ({ page }) => {
    await page.goto('/calendar/2026-08-10');
    await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();

    await instant(page, async () => {
      await page.getByRole('link', { name: 'Booking link' }).click();
      await page.waitForURL(url => url.pathname === '/booking');
      await expect(page.getByRole('heading', { name: 'Booking link', level: 1 })).toBeVisible();
      await expect(page.getByText('No booking link yet')).toHaveCount(0);
    });

    await expect(page.getByText('No booking link yet')).toBeVisible();
  });
});
