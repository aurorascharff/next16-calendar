import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Home page (/)', () => {
  test("authenticated visits redirect to today's calendar", async ({ page }) => {
    await signIn(page);
    await page.goto('/');

    await page.waitForURL(url => url.pathname.startsWith('/calendar/'));
    await expect(page.getByRole('link', { name: 'Calendar' })).toHaveAttribute('aria-current', 'page');
  });
});
