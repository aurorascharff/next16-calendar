import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Calendar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
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
    await expect(miniMonth.getByRole('link', { name: '27', exact: true })).toHaveAttribute(
      'href',
      '/calendar/2026-07-27?view=month',
    );
    await miniMonth.getByText('11', { exact: true }).click();
    await expect(page).toHaveURL('/calendar/2026-08-10?view=month');

    await page.goto('/calendar/2026-08-01');
    await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();
    await expect(miniMonth.locator('a[href="/calendar/2026-07-27"]')).toHaveText('27');
  });
});
