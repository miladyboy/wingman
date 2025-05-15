import { test, expect } from '@playwright/test';

test.describe('Cookie Consent', () => {
  test('shows banner, respects accept/refuse, and persists choice', async ({ page }) => {
    await page.goto('/');
    // Banner should appear
    await expect(page.getByText(/We use cookies for analytics/i)).toBeVisible();
    // Analytics should not be initialized
    await expect(page.evaluate(() => window.posthog)).resolves.toBeUndefined();

    // Accept cookies
    await page.getByTestId('cookie-accept').click();
    // Banner should disappear
    await expect(page.getByText(/We use cookies for analytics/i)).not.toBeVisible();
    // Analytics should be initialized
    await page.waitForFunction(() => window.posthog !== undefined);

    // Reload and banner should not reappear
    await page.reload();
    await expect(page.getByText(/We use cookies for analytics/i)).not.toBeVisible();

    // Refuse cookies (simulate by clearing and refusing)
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId('cookie-refuse').click();
    await expect(page.getByText(/We use cookies for analytics/i)).not.toBeVisible();
    // Analytics should not be initialized
    await expect(page.evaluate(() => window.posthog)).resolves.toBeUndefined();
  });
}); 