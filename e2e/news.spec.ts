import { expect, test } from '@playwright/test';
import { HOME_PATH } from './paths';

/*
 * The News page (owner's audit, 2026-11-21): reached from the Stories
 * section's ALL NEWS, it lists the same stories as the section, each linking
 * to its article in a new tab; and it is in both languages.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('fc-intro-seen', '1'));
});

test('ALL NEWS opens the News page, which lists every story of the home page', async ({ page }) => {
  await page.goto(HOME_PATH);
  const onHome = await page.locator('#stories .story').count();
  expect(onHome).toBeGreaterThan(0);

  await page.locator('#stories').getByRole('link', { name: /ALL NEWS/ }).click();
  await expect(page).toHaveURL(/\/en\/news$/);
  await expect(page.getByRole('heading', { level: 1, name: 'News' })).toBeVisible();
  const cards = page.locator('.news-grid .story');
  await expect(cards).toHaveCount(onHome);
  await expect(cards.first()).toHaveAttribute('target', '_blank');
  await expect(cards.first()).toHaveAttribute('href', /^https:\/\//);
});

test('the News page speaks Vietnamese under /vi', async ({ page }) => {
  await page.goto('/vi/news');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.getByRole('heading', { level: 1, name: 'Tin tức' })).toBeVisible();
  await expect(page).toHaveTitle(/Tin tức/);
});
