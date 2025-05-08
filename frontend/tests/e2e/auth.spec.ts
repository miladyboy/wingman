import { test, expect } from '@playwright/test';
import { getConfirmationLink } from './utils/mailtrap';

function generateUniqueEmail() {
  return `e2euser+${Date.now()}@example.com`;
}

const password = 'TestPassword123!';

const routes = {
  auth: '/auth',
  app: '/app',
  subscribe: '/subscribe',
};

const selectors = {
  registerUsername: '[data-testid="register-username"]',
  registerEmail: '[data-testid="register-email"]',
  registerPassword: '[data-testid="register-password"]',
  registerSubmit: '[data-testid="register-submit"]',
  loginEmail: '[data-testid="login-email"]',
  loginPassword: '[data-testid="login-password"]',
  loginSubmit: '[data-testid="login-submit"]',
  logoutButton: '[data-testid="logout-button"]',
  toggleToRegister: 'text=Need an account? Register',
};

test.describe('Supabase Auth Flows', () => {
  test('User can register, confirm email, logout, and login', async ({ page }) => {
    const email = generateUniqueEmail();
    const username = `user${Date.now()}`;
    // Register
    await page.goto(routes.auth);
    await page.click(selectors.toggleToRegister);
    await page.fill(selectors.registerUsername, username);
    await page.fill(selectors.registerEmail, email);
    await page.fill(selectors.registerPassword, password);
    await page.click(selectors.registerSubmit);
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
    // Wait for the logout button to be visible and then click it.
    // Increased timeout to handle potential rendering delays after navigation.
    await expect(page.locator(selectors.logoutButton)).toBeVisible({ timeout: 10000 }); 
    await page.locator(selectors.logoutButton).click();

    await expect(page).toHaveURL('/');

    // Login
    await page.goto(routes.auth);
    await page.fill(selectors.loginEmail, email);
    await page.fill(selectors.loginPassword, password);
    await page.click(selectors.loginSubmit);
    await expect(page).toHaveURL(routes.subscribe);
  });
}); 