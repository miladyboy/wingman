import { test, expect } from '@playwright/test';

const TEST_USER_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || 'testuser@example.com';
const TEST_USER_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD || 'testpassword';

/**
 * E2E: Protected Route /app
 */
test.describe('/app route protection', () => {
  test('unauthenticated user is redirected from /app to /', async ({ page }) => {
    await page.goto('/app');
    // Should be redirected to landing page ("/"), which contains a known element
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1.font-headline')).toContainText('Your Personal AI Wingman');
  });

  test('authenticated user can access /app', async ({ page }) => {
    // Go to auth page and log in
    await page.goto('/auth');
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');
    // Wait for redirect to /app
    await page.waitForURL('/app', { timeout: 10000 });
    // Check for main app UI (sidebar, chat, etc.)
    await expect(page.locator('button', { hasText: '+ New Chat' })).toBeVisible();
    await expect(page.locator('div')).toContainText('Logged in as');
  });
}); 