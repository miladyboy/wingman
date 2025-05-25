import { test, expect } from './utils/fixtures';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Landing Page', () => {
  test('should load and display the main headline and CTA', async ({ page }) => {
    await page.goto('/');
    // Check main headline
    const headline = page.getByTestId('landing-page-headline');
    await expect(headline).toBeVisible();
    await expect(headline).toContainText('Turn every DM into a date');

    // Check primary CTA button (if data-testid is available, prefer getByTestId)
    // Otherwise, fallback to getByRole
    const getAccessBtn = page.getByRole('button', { name: /get access/i });
    await expect(getAccessBtn).toBeVisible();
    await expect(getAccessBtn).toBeEnabled();

    // Optionally, check the final CTA
    const startNowBtn = page.getByRole('button', { name: /start now/i });
    await expect(startNowBtn).toBeVisible();
  });
}); 