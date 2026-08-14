import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Calendar page (/calendar/[date])', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('switching weeks reveals the calendar fallback immediately', async ({ page }) => {
    await page.goto('/calendar/2026-09-24');

    await instant(page, async () => {
      await page.getByRole('link', { name: 'Next week' }).click();
      await page.waitForURL('/calendar/2026-10-01');
      await expect(page.getByRole('status', { name: 'Loading calendar view' })).toBeVisible();
    });
  });

  // Enable this stricter target after caching and prefetching the destination week.
  test('switching weeks reveals the destination calendar immediately', async ({ page }) => {
    await page.goto('/calendar/2026-09-24');

    await instant(page, async () => {
      await page.getByRole('link', { name: 'Next week' }).click();
      await page.waitForURL('/calendar/2026-10-01');
      await expect(page.getByRole('button', { name: 'Add all-day event on Thu, 1 Oct' })).toBeVisible();
      await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();
    });
  });

  test('client navigation marks the calendar active immediately', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.getByRole('heading', { name: 'Booking link', level: 1 })).toBeVisible();

    await instant(page, async () => {
      await page.getByRole('link', { name: 'Calendar' }).click();
      await page.waitForURL(url => url.pathname.startsWith('/calendar/'));
      await expect(page.getByRole('link', { name: 'Calendar' })).toHaveAttribute('aria-current', 'page');
    });
  });
});
