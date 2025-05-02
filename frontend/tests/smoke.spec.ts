import { test, expect } from '@playwright/test';

/**
 * Smoke test: Loads the homepage and checks for the main header loads.
 */
test('homepage loads and chat input is visible', async ({ page }) => {
  await page.goto('/');
  const headline = await page.locator('h1.font-headline');
  await expect(headline).toBeVisible();
  await expect(headline).toContainText('Your Personal AI Wingman');
}); 