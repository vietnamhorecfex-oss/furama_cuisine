import { expect, test } from '@playwright/test';
import { HOME_PATH } from './paths';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('fc-intro-seen', '1'));
});

test('home page lists the restaurant catalogue', async ({ page }) => {
  await page.goto(HOME_PATH);
  await expect(page.locator('.rcard')).toHaveCount(12);
});

test('the hero has one dot per slide, and a dot shows its slide', async ({ page }) => {
  await page.goto(HOME_PATH);
  // The three slides migration 008 seeds (hero_slides).
  await expect(page.locator('.hero-dots .hero-dot')).toHaveCount(3);
  await page.locator('.hero-dot').nth(1).click();
  await expect(page.locator('.hero-slide').nth(1)).toHaveAttribute('data-active', 'true');
  await expect(page.locator('.hero-slide').nth(0)).toHaveAttribute('data-active', 'false');
});

test('the hero slideshow can be paused and played again (WCAG 2.2.2)', async ({ page }) => {
  await page.clock.install();
  await page.goto(HOME_PATH);
  const pause = page.getByRole('button', { name: 'Pause the slideshow' });
  await pause.click();
  await expect(page.getByRole('button', { name: 'Play the slideshow' })).toHaveAttribute('aria-pressed', 'true');
  // Well past the slide's time (site_settings.hero_autoplay_ms): it stays on the first slide.
  await page.clock.runFor(20_000);
  await expect(page.locator('.hero-slide').nth(0)).toHaveAttribute('data-active', 'true');
  await page.getByRole('button', { name: 'Play the slideshow' }).click();
  await page.clock.runFor(20_000);
  await expect(page.locator('.hero-slide').nth(0)).toHaveAttribute('data-active', 'false');
});

test('a reduced-motion guest gets no slideshow, so no pause button', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(HOME_PATH);
  await expect(page.locator('.hero-dots .hero-dot')).toHaveCount(3);
  await expect(page.locator('.hero-pause')).toHaveCount(0);
  await context.close();
});
