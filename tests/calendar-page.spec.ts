import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('initial load exposes the calendar shell immediately', async ({ baseURL, page }) => {
    await instant(
      page,
      async () => {
        await page.goto('/calendar/2026-08-10');
        await expect(page.getByRole('navigation').getByText('Calendar')).toBeVisible();
        await expect(page.getByRole('status', { name: 'Loading calendar view' })).toBeVisible();
      },
      { baseURL },
    );

    await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();
  });

  test('switching to month keeps the navigation instant', async ({ page }) => {
    await page.goto('/calendar/2026-08-10');
    await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();

    await instant(page, async () => {
      await page.getByRole('link', { name: 'Month', exact: true }).click();
      await page.waitForURL(url => url.searchParams.get('view') === 'month');
      await expect(page.getByRole('link', { name: 'Month', exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(page.getByText('Focus time').first()).toBeVisible();
    });

    await expect(page.getByText('Focus time').first()).toBeVisible();
  });

  test('dragging an empty time range shows its preview before pointer release', async ({ page }) => {
    await page.goto('/calendar/2026-08-10');
    await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();

    const dayColumn = page.locator('[data-day-column]').nth(2);
    const bounds = await dayColumn.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) return;

    const x = bounds.x + bounds.width / 2;
    const startY = bounds.y + 6 * 72;
    await page.mouse.move(x, startY);
    await page.mouse.down();
    await page.mouse.move(x, startY + 72, { steps: 4 });

    await expect(dayColumn.locator('.cal-chip').filter({ hasText: 'New event' })).toBeVisible();

    await page.mouse.up();
    await expect(page.getByRole('dialog', { name: 'New event' })).toBeVisible();
  });

  test('releasing a resize handle commits the final duration', async ({ page }) => {
    await page.goto('/calendar/2026-08-10');
    const event = page.getByTitle('Release planning · 11:00');
    await expect(event).toHaveCount(1);
    await expect(event).toBeVisible();

    const initialBounds = await event.boundingBox();
    const resizeHandle = event.locator('[data-resize-handle]');
    await resizeHandle.hover();
    const handleBounds = await resizeHandle.boundingBox();
    expect(initialBounds).not.toBeNull();
    expect(handleBounds).not.toBeNull();
    if (!initialBounds || !handleBounds) return;

    const x = handleBounds.x + handleBounds.width / 2;
    const y = handleBounds.y + handleBounds.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 72);

    await expect.poll(async () => (await event.boundingBox())?.height).toBeGreaterThan(initialBounds.height);

    await page.mouse.up();
    await expect(page.getByText('Create your own calendar to make changes.')).toBeVisible();
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
