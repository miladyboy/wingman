import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Landing Page', () => {
  test('should load and display the main headline and CTA', async ({ page }) => {
    await page.goto('/');
    // Check main headline
    const headline = page.locator('h1.font-headline');
    await expect(headline).toBeVisible();
    await expect(headline).toContainText('Your Personal AI Wingman');

    // Check primary CTA button
    const startChattingBtn = page.getByRole('button', { name: /start chatting/i });
    await expect(startChattingBtn).toBeVisible();
    await expect(startChattingBtn).toBeEnabled();

    // Optionally, check the final CTA
    const requestAccessBtn = page.getByRole('button', { name: /request access/i });
    await expect(requestAccessBtn).toBeVisible();
  });
}); 