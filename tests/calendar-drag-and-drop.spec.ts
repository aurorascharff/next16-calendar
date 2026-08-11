import { expect, test } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Calendar drag and resize', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto('/calendar/2026-08-10');
    await expect(page.getByTitle('Focus time · 08:30').first()).toBeVisible();
  });

  test('clicking an event opens its details', async ({ page }) => {
    await page.getByTitle('Release planning · 11:00').click();

    await expect(page.getByRole('heading', { name: 'Release planning' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  });

  test('opening an all-day event focuses the title', async ({ page }) => {
    await page.getByRole('button', { name: 'Add all-day event on Mon 10 Aug' }).click();

    const dialog = page.getByRole('dialog', { name: 'New event' });
    await expect(dialog.getByRole('textbox', { name: 'Title' })).toBeFocused();
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

  test('dragging an event into another day keeps the preview active until release', async ({ page }) => {
    const event = page.getByTitle('Release planning · 11:00');
    const eventBounds = await event.boundingBox();
    expect(eventBounds).not.toBeNull();
    if (!eventBounds) return;

    const dayColumns = page.locator('[data-day-column]');
    const eventCenterX = eventBounds.x + eventBounds.width / 2;
    const columnBounds = await Promise.all(
      Array.from({ length: 7 }, (_, index) => dayColumns.nth(index).boundingBox()),
    );
    const originIndex = columnBounds.findIndex(
      bounds => bounds && eventCenterX >= bounds.x && eventCenterX <= bounds.x + bounds.width,
    );
    expect(originIndex).toBeGreaterThanOrEqual(0);

    const targetIndex = originIndex === 6 ? 5 : originIndex + 1;
    const targetBounds = columnBounds[targetIndex];
    expect(targetBounds).not.toBeNull();
    if (!targetBounds) return;

    const targetX = targetBounds.x + targetBounds.width / 2;
    const targetY = eventBounds.y + eventBounds.height / 2;
    await page.mouse.move(eventCenterX, targetY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY, { steps: 6 });

    await expect
      .poll(async () => {
        const movedBounds = await event.boundingBox();
        if (!movedBounds) return false;
        const movedCenterX = movedBounds.x + movedBounds.width / 2;
        return movedCenterX >= targetBounds.x && movedCenterX <= targetBounds.x + targetBounds.width;
      })
      .toBe(true);

    const actionRequest = page.waitForRequest(
      request => request.method() === 'POST' && Boolean(request.headers()['next-action']),
    );
    await page.mouse.up();
    await actionRequest;
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
