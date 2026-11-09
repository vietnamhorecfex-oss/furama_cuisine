import { expect, test } from '@playwright/test';
import { HOME_PATH } from './paths';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('fc-intro-seen', '1'));
});

test('home page lists the restaurant catalogue', async ({ page }) => {
  await page.goto(HOME_PATH);
  await expect(page.locator('.rcard')).toHaveCount(12);
});

test('the hero has one dot per slide, and a dot shows its slide (a guest who reduces motion: no film)', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(HOME_PATH);
  // The three slides migration 008 seeds (hero_slides).
  await expect(page.locator('.hero-dots .hero-dot')).toHaveCount(3);
  await page.locator('.hero-dot').nth(1).click();
  await expect(page.locator('.hero-slide').nth(1)).toHaveAttribute('data-active', 'true');
  await expect(page.locator('.hero-slide').nth(0)).toHaveAttribute('data-active', 'false');
  await context.close();
});

test('the hero plays its background film in the slideshow’s place; it can be paused and played again (WCAG 2.2.2)', async ({ page }) => {
  await page.goto(HOME_PATH);
  const video = page.locator('#top .hero-film-layer video');
  await expect(page.locator('#top .hero-film-layer')).toHaveAttribute('data-running', 'true');
  await expect(page.locator('.hero-dots .hero-dot')).toHaveCount(0);
  const pause = page.getByRole('button', { name: 'Pause the video' });
  await pause.click();
  await expect(page.getByRole('button', { name: 'Play the video' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play the video' }).click();
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
});

test('a reduced-motion guest gets no film and no slideshow, so no pause button', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(HOME_PATH);
  await expect(page.locator('.hero-dots .hero-dot')).toHaveCount(3);
  await expect(page.locator('.hero-pause')).toHaveCount(0);
  await expect(page.locator('#top video')).toHaveCount(0);
  await context.close();
});
