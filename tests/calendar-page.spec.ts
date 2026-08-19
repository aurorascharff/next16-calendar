import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Calendar page (/calendar/[date])', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('initial load exposes the calendar shell immediately', async ({ baseURL, page }) => {
    await instant(
      page,
      async () => {
        await page.goto('/calendar/2026-08-10');
        await expect(page.getByRole('navigation').getByText('Calendar')).toBeVisible();
        await expect(page.locator('[data-calendar-header-loading]')).toBeVisible();
        await expect(page.getByRole('status', { name: 'Loading calendar controls' })).toBeVisible();
        await expect(page.getByRole('status', { name: 'Loading calendar view' })).toBeVisible();
      },
      { baseURL },
    );

    await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();
  });

  test('switching to month reveals the prefetched calendar immediately', async ({ page }) => {
    await page.goto('/calendar/2026-08-10');
    await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();

    await instant(page, async () => {
      await page.getByRole('link', { name: 'Month', exact: true }).click();
      await page.waitForURL(url => url.searchParams.get('view') === 'month');
      await expect(page.getByRole('link', { name: 'Month', exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(page.getByText('Focus time').first()).toBeVisible();
    });

    await expect(page.getByRole('link', { name: 'Month', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByText('Focus time').first()).toBeVisible();
  });

  test('dates in the visible calendar range do not navigate', async ({ page }) => {
    await page.goto('/calendar/2026-08-10');
    await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();

    const miniMonth = page.locator('[data-component="MiniMonth"]');
    await expect(miniMonth.getByRole('link', { name: '11', exact: true })).toHaveCount(0);
    await miniMonth.getByText('11', { exact: true }).click();
    await expect(page).toHaveURL('/calendar/2026-08-10');

    await page.getByRole('link', { name: 'Month', exact: true }).click();
    await expect(page).toHaveURL('/calendar/2026-08-10?view=month');
    await expect(miniMonth.getByRole('link', { name: '11', exact: true })).toHaveCount(0);
    await miniMonth.getByText('11', { exact: true }).click();
    await expect(page).toHaveURL('/calendar/2026-08-10?view=month');
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
