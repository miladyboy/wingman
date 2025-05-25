import { test as setup, expect } from '@playwright/test';
import { registerAndConfirmUser, completeSubscription, loginUser, logoutUser } from './utils/userFlows';

const authFiles = {
  emailVerified: 'playwright/.auth/emailVerifiedUser.json',
  subscribed: 'playwright/.auth/subscribedUser.json',
};

setup('authenticate multiple users', async ({ page }) => {
  // --- Email Verified (Unsubscribed) User ---
  const testEmailVerified = process.env.PLAYWRIGHT_TEST_EMAIL_VERIFIED;
  const testPasswordVerified = process.env.PLAYWRIGHT_TEST_PASSWORD_VERIFIED;

  if (testEmailVerified && testPasswordVerified) {
    await loginUser(page, testEmailVerified, testPasswordVerified);
    await expect(page).toHaveURL(/\/subscribe/);
    await expect(page.locator('[data-testid="proceed-to-checkout-button"]')).toBeVisible({ timeout: 10000 });
  } else {
    await registerAndConfirmUser(page);
    await expect(page.locator('[data-testid="proceed-to-checkout-button"]')).toBeVisible({ timeout: 10000 });
  }
  await page.context().storageState({ path: authFiles.emailVerified });
  await logoutUser(page);

  // --- Subscribed User ---
  const testEmailEnv = process.env.PLAYWRIGHT_TEST_EMAIL_SUBSCRIBED;
  const testPasswordEnv = process.env.PLAYWRIGHT_TEST_PASSWORD_SUBSCRIBED;

  if (testEmailEnv && testPasswordEnv) {
    await loginUser(page, testEmailEnv, testPasswordEnv);
    await expect(page).toHaveURL(/\/app/);
    await expect(page.locator('[data-testid="new-chat-button"], nav button:has-text("+ New Chat")').first()).toBeVisible({ timeout: 10000 });
  } else {
    await registerAndConfirmUser(page);
    await completeSubscription(page);
    await expect(page).toHaveURL(/\/app/);
    await expect(page.locator('[data-testid="new-chat-button"], nav button:has-text("+ New Chat")').first()).toBeVisible({ timeout: 10000 });
  }
  await page.context().storageState({ path: authFiles.subscribed });
}); 