import { expect, Page } from '@playwright/test'
import { env } from './env'

const { PLAYWRIGHT_TEST_BASE_URL } = env

export async function login(
  page: Page,
  loginData: { email: string; password: string; remember?: boolean }
) {
  const { email, password, remember = true } = loginData;
  await page.goto(PLAYWRIGHT_TEST_BASE_URL+'/connexion');

  await page.fill('#email', email);
  await page.fill('#password', password);

  const isChecked = await page.isChecked('#remember');
  if (remember !== isChecked) {
    await page.click('label[for="remember"]');
  }

  await Promise.all([
    page.click('button#btn_ws_login'),
    page.waitForLoadState('networkidle'),
  ]);

  // Select only the first matching link with the desired href to avoid strict mode violation
  const homeLink = page.locator('div.header-content a[href*="etu.essr.ch/home"]').first();
  await expect(homeLink).toBeVisible();
}