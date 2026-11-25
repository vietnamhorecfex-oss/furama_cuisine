import { expect, test } from '@playwright/test';
import { HOME_PATH } from './paths';

/*
 * The UX/UI audit of 2026-11-25, its first batch of code fixes on the guest site:
 * Escape closes an open list alone (UX-05, still so after the first fix), the
 * phone's Back closes an overlay instead of leaving the site (DH-03), a jump
 * from the header's menu takes the focus to the section (DH-02), and a
 * Vietnamese search finds what the cards say in Vietnamese (DH-01).
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('fc-intro-seen', '1'));
});

const reserve = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'RESERVE', exact: true }).filter({ visible: true }).first();

test('Escape with a list open in the Reserve drawer closes the list alone; a second Escape closes the drawer', async ({ page }) => {
  await page.goto(HOME_PATH);
  await reserve(page).click();
  const drawer = page.getByRole('dialog', { name: 'Reserve a table' });
  await expect(drawer.locator('.drawer-kicker')).toBeFocused();

  const trigger = drawer.locator('.dd-trigger').first();
  await trigger.click();
  await expect(drawer.getByRole('listbox')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(drawer.getByRole('listbox')).toHaveCount(0);
  await expect(drawer).toBeVisible();
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
});

test('Back closes the Reserve drawer and stays on the page, the name typed kept', async ({ page }) => {
  await page.goto(HOME_PATH);
  await reserve(page).click();
  const drawer = page.getByRole('dialog', { name: 'Reserve a table' });
  await expect(drawer.locator('.drawer-kicker')).toBeFocused();
  await drawer.getByRole('textbox', { name: /Full name/ }).fill('Audit Back');

  await page.goBack();
  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL(new RegExp(`${HOME_PATH}$`));

  await reserve(page).click();
  await expect(drawer.getByRole('textbox', { name: /Full name/ })).toHaveValue('Audit Back');
});

test('a section picked in the header menu takes the focus, so the next Tab is in that section', async ({ page }) => {
  await page.goto(HOME_PATH);
  const offers = page.getByRole('banner').getByRole('button', { name: /^offers$/i });
  await offers.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('#offers'))).toBe(true);
});

test('on /vi the search finds a restaurant by its cuisine in Vietnamese', async ({ page }) => {
  await page.goto('/vi');
  await page.getByRole('banner').getByRole('button', { name: 'TÌM KIẾM', exact: true }).click();
  const box = page.getByRole('dialog').getByRole('textbox');
  await box.fill('lẩu');
  await expect(page.getByRole('dialog').locator('.search-result').first()).toBeVisible();
});
