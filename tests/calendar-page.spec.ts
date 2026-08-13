import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Calendar page (/calendar/[date])', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('initial load exposes the calendar loading view immediately', async ({ baseURL, page }) => {
    await instant(
      page,
      async () => {
        await page.goto('/calendar/2026-08-10');
        await expect(page.getByRole('navigation').getByText('Calendar')).toBeVisible();
        await expect(page.getByRole('status', { name: 'Loading calendar view' })).toBeVisible();
      },
      { baseURL },
    );
  });

  // Target after adding the lower page boundary: the next week can commit into
  // the calendar fallback while its route-dependent data continues streaming.
  /*
  test('switching weeks reveals the calendar fallback immediately', async ({ page }) => {
    await page.goto('/calendar/2026-09-24');

    await instant(page, async () => {
      await page.getByRole('link', { name: 'Next week' }).click();
      await page.waitForURL('/calendar/2026-10-01');
      await expect(page.getByRole('status', { name: 'Loading calendar view' })).toBeVisible();
    });
  });
  */

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
