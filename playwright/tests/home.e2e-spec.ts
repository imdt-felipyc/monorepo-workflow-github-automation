import { test, expect } from '@playwright/test';

test.describe('home', () => {
  test('should display the phrase "Gesundheitskurse für alle" on the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Gesundheitskurse für alle')).toBeVisible();
  });

  test(
    'each header menu item page should contain the class course-atf__content',
    async ({ page }) => {
      await page.goto('/');
      await page.locator('.header__nav-list-item--mm').hover();

      const links = await page.locator('.mega-menu-list--item a').all();
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href) {
          const newPage = await page.context().newPage();
          await newPage.goto(href, { timeout: 60000 });
          await expect(newPage.locator('.course-atf__content')).toBeVisible({ timeout: 60000 });
          await newPage.close();
        }
      }
    },
  );
});