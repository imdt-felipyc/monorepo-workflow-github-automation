import { test, expect } from '@playwright/test';

test.describe('home', () => {
  test('should display the phrase "Formations Santé pour Tous" on the home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.getByText('Formations Santé pour Tous')).toBeVisible();
  });
  

  test(
    'each Formations menu item page should contain the class course-atf__content',
    async ({ page }) => {
      test.setTimeout(180000);
      await page.goto('/', { waitUntil: 'networkidle' });

      // Aguarda o menu aparecer
      await page.waitForSelector('.dynamic-item.has-children .title .label', { timeout: 10000 });

      // Seleciona o item "Formations" pelo texto
      const formationsMenu = page.locator('.dynamic-item.has-children .title .label', { hasText: 'Formations' });
      await formationsMenu.hover();

      // Wait for the submenu to appear
      await page.waitForSelector('.dynamic-child-children a.category-link', { timeout: 5000 });

      // Get all links under the Formations mega menu
      const links = await page.locator('.dynamic-child-children a.category-link').all();

      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href) {
          const newPage = await page.context().newPage();
          await newPage.goto(href, { waitUntil: 'networkidle', timeout: 60000});
          await expect(newPage.locator('.course-atf__content')).toBeVisible({ timeout: 60000 });
          await newPage.close();
        }
      }
    }
  );
});