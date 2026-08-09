import type { Page } from '@playwright/test';

export async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('flow-e2e@example.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL(url => url.pathname.startsWith('/calendar/'));
}
