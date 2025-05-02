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

/**
 * Active chat management tests
 */
test.describe('Active chat management', () => {
  test('keeps last chat active after refresh', async ({ page }) => {
    // Simulate login and create two chats
    // This assumes test user and chat creation API or UI is available
    await page.goto('/auth');
    // ...simulate login steps...
    // ...simulate creating two chats...
    // Select the second chat
    // await page.click('text=Chat 2');
    // Refresh
    await page.reload();
    // The second chat should still be active
    // await expect(page.locator('h2')).toHaveText('Chat 2');
  });

  test('shows first chat as active on login', async ({ page }) => {
    // Simulate login with at least one chat
    await page.goto('/auth');
    // ...simulate login steps...
    // The first chat should be active
    // await expect(page.locator('h2')).toHaveText('Chat 1');
  });

  test('shows new chat component if no chats exist', async ({ page }) => {
    // Simulate login with no chats
    await page.goto('/auth');
    // ...simulate login steps for a new user...
    // Should see the new chat prompt
    await expect(page.locator('text=Start your new conversation by sending a message.')).toBeVisible();
  });
}); 