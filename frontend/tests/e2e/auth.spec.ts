import { test, expect } from '@playwright/test';
import { getConfirmationLink } from './utils/mailtrap';
import { generateUniqueEmail, TEST_PASSWORD } from './utils/userFlows';

test.use({ storageState: { cookies: [], origins: [] } });

const routes = {
  auth: '/auth',
  app: '/app',
  subscribe: '/subscribe',
};

test.describe('Supabase Auth Flows', () => {
  test('User can register, confirm email, logout, and login', async ({ page }) => {
    const email = generateUniqueEmail();
    const username = `user${Date.now()}`;
    // Register
    await page.goto(routes.auth);
    await page.getByText('Need an account? Register').click();
    await page.getByTestId('register-username').fill(username);
    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-password').fill(TEST_PASSWORD);
    await page.getByTestId('register-submit').click();
    // Wait for the confirmation email to arrive
    await page.waitForTimeout(4000); // Consider polling for robustness
    // Fetch the confirmation link from Mailtrap
    const confirmationLink = await getConfirmationLink();
    expect(confirmationLink).toBeTruthy();
    // Visit the confirmation link (lands on /, then frontend redirects to /subscribe)
    await page.goto(confirmationLink);
    // Wait for the frontend to redirect to /subscribe
    await page.waitForURL('**/subscribe');
    await expect(page).toHaveURL(routes.subscribe);

    // Log out
    // Try desktop first
    const desktopButton = page.locator('[data-testid="profile-menu-button"]');
    if (await desktopButton.count() > 0 && await desktopButton.first().isVisible()) {
      await desktopButton.first().click();
      await page.getByTestId('profile-menu-dropdown').waitFor({ state: 'visible', timeout: 5000 });
      await page.getByTestId('profile-menu-logout').click();
    } else {
      // Fallback to mobile
      const mobileButton = page.locator('[data-testid="profile-menu-button-drawer"]');
      await mobileButton.first().click();
      await page.getByTestId('profile-menu-dropdown-mobile').waitFor({ state: 'visible', timeout: 5000 });
      await page.getByTestId('profile-menu-logout-mobile').click();
    }

    await expect(page).toHaveURL('/');

    // Login
    await page.goto(routes.auth);
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(routes.subscribe);
  });
}); 