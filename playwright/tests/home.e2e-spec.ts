import { test, expect } from '@playwright/test';

test.describe('home', () => {
  test('should display the phrase "Gesundheitskurse für alle"', async ({ page }, testInfo) => {
    await page.goto('/');

    const isMobile = testInfo.project.name.toLowerCase().includes('mobile');

    if (isMobile) {
      await expect(page.getByText('Gesundheitskurse für alle')).toBeVisible();
      return ;
    }

    await expect(page.getByText('Gesundheitskurse für alle')).toBeVisible();
  });

  test(
    'each item in the "Alle Ausbildungen" menu should be accessible and contain the class course-atf__content',
    async ({ page }, testInfo) => {
      
      await page.goto('/');
      test.setTimeout(600000);

      const isMobile = testInfo.project.name.toLowerCase().includes('mobile');

      if (isMobile) {
        
        // Use a generic variable name for the menu locator
        await page.locator('#menu-toggler').click();
        await page.getByText('Alle Ausbildungen Für').click();

        const links = await page.locator('.mega-menu-list--item a').all();

        for (const link of links) {
          const href = await link.getAttribute('href');
          if (href && href.startsWith('http')) {
            const newPage = await page.context().newPage();
            await newPage.goto(href, { timeout: 60000 });
            await expect(newPage.locator('.course-atf__content')).toBeVisible({ timeout: 60000 });
            await newPage.close();
          }
        }
        
        return ;
      }


      await page.waitForSelector('.header__nav-list', { timeout: 10000 });

      // Use a generic variable name for the menu locator
      const menuLocator = page.locator('.header__nav-list-item--mm', { hasText: 'Alle Ausbildungen' });
      await menuLocator.hover();

      await page.waitForSelector('.mega-menu', { timeout: 5000 });

      const links = await page.locator('.mega-menu-list--item a').all();

      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href && href.startsWith('http')) {
          const newPage = await page.context().newPage();
          await newPage.goto(href, { timeout: 60000 });
          await expect(newPage.locator('.course-atf__content')).toBeVisible({ timeout: 60000 });
          await newPage.close();
        }
      }
    }
  );
});