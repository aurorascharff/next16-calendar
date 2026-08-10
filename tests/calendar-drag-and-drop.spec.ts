import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Calendar drag and resize', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto('/calendar/2026-08-10');
    await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();
  });

  test('dragging an empty time range shows its preview before pointer release', async ({ page }) => {
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

  test('clicking a resize handle without changing its duration does not save', async ({ page }) => {
    const event = page.getByTitle('Release planning · 11:00');
    await expect(event).toHaveCount(1);
    await expect(event).toBeVisible();

    const resizeHandle = event.locator('[data-resize-handle]');
    await resizeHandle.hover();
    const actionRequest = page
      .waitForRequest(request => request.method() === 'POST' && Boolean(request.headers()['next-action']), {
        timeout: 750,
      })
      .then(
        () => true,
        () => false,
      );

    await page.mouse.down();
    await page.mouse.up();

    expect(await actionRequest).toBe(false);
  });

  test('dragging within the same snapped event position does not save', async ({ page }) => {
    const event = page.getByTitle('Release planning · 11:00');
    await expect(event).toHaveCount(1);
    await expect(event).toBeVisible();

    const bounds = await event.boundingBox();
    expect(bounds).not.toBeNull();
    if (!bounds) return;

    const actionRequest = page
      .waitForRequest(request => request.method() === 'POST' && Boolean(request.headers()['next-action']), {
        timeout: 750,
      })
      .then(
        () => true,
        () => false,
      );
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 5, y);
    await page.mouse.up();

    expect(await actionRequest).toBe(false);
  });
});
