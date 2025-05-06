import { test, expect } from '@playwright/test';
import fetch from 'node-fetch';
import { getConfirmationLink } from './utils/mailtrap';

// Utility to generate a unique email for each test run
function generateUniqueEmail() {
  return `e2euser+${Date.now()}@example.com`;
}

const password = 'TestPassword123!';

// Adjust these routes and selectors as needed for your app
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
  appWelcome: '[data-testid="welcome-message"]',
  checkEmailMessage: '[data-testid="check-email-message"]',
  toggleToRegister: 'text=Need an account? Register',
  toggleToLogin: 'text=Already have an account? Sign In',
};

/**
 * Helper to poll MailHog for a verification email and extract the verification link.
 * Assumes MailHog is running at http://localhost:8025
 */
async function getVerificationLink(email: string): Promise<string> {
  for (let i = 0; i < 10; i++) { // Try for up to ~5 seconds
    const response = await fetch('http://localhost:8025/api/v2/messages');
    const data: any = await response.json();
    const message = data.items.find((msg: any) =>
      msg.Content.Headers.To && msg.Content.Headers.To.includes(email)
    );
    if (message) {
      // Extract the verification link from the email body (adjust regex as needed)
      const match = message.Content.Body.match(/https?:\/\/[^\s]+/);
      if (match) return match[0];
    }
    await new Promise(res => setTimeout(res, 500));
  }
  throw new Error('No verification email found for ' + email);
}

test.describe('Supabase Auth Flows', () => {
  test('User can register', async ({ page }) => {
    const email = generateUniqueEmail();
    const username = `user${Date.now()}`;
    await page.goto(routes.auth);
    // Always toggle to register mode
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
    // Or, if you have routes.subscribe defined:
    await expect(page).toHaveURL(routes.subscribe);
  });

//   test('User can login', async ({ page }) => {
//     // Register a user first
//     const email = generateUniqueEmail();
//     const username = `user${Date.now()}`;
//     await page.goto(routes.auth);
//     await page.click(selectors.toggleToRegister);
//     await page.fill(selectors.registerUsername, username);
//     await page.fill(selectors.registerEmail, email);
//     await page.fill(selectors.registerPassword, password);
//     await page.click(selectors.registerSubmit);
//     await expect(page).toHaveURL(routes.app);
//     // Log out to test login
//     if (await page.locator(selectors.logoutButton).count() > 0) {
//       await page.click(selectors.logoutButton);
//     }
//     await expect(page).toHaveURL(routes.auth);
//     // Now login (already in login mode)
//     await page.fill(selectors.loginEmail, email);
//     await page.fill(selectors.loginPassword, password);
//     await page.click(selectors.loginSubmit);
//     await expect(page).toHaveURL(routes.app);
//     await expect(page.locator(selectors.appWelcome)).toBeVisible();
//   });

//   test('User can logout', async ({ page }) => {
//     // Register and login a user first
//     const email = generateUniqueEmail();
//     const username = `user${Date.now()}`;
//     await page.goto(routes.auth);
//     await page.click(selectors.toggleToRegister);
//     await page.fill(selectors.registerUsername, username);
//     await page.fill(selectors.registerEmail, email);
//     await page.fill(selectors.registerPassword, password);
//     await page.click(selectors.registerSubmit);
//     await expect(page).toHaveURL(routes.app);
//     // Now logout
//     if (await page.locator(selectors.logoutButton).count() > 0) {
//       await page.click(selectors.logoutButton);
//     }
//     await expect(page).toHaveURL(routes.auth);
//     // Optionally, check for login form
//     await expect(page.locator(selectors.loginEmail)).toBeVisible();
//   });

//   test('User can register, verify email, and login (with MailHog)', async ({ page }) => {
//     const email = generateUniqueEmail();
//     const username = `user${Date.now()}`;
//     await page.goto(routes.auth);
//     await page.click(selectors.toggleToRegister);
//     await page.fill(selectors.registerUsername, username);
//     await page.fill(selectors.registerEmail, email);
//     await page.fill(selectors.registerPassword, password);
//     await page.click(selectors.registerSubmit);
//     // Wait for "check your email" message
//     await expect(page.locator(selectors.checkEmailMessage)).toBeVisible();

//     // Poll MailHog for the verification email and extract the link
//     const verificationLink = await getVerificationLink(email);

//     // Visit the verification link to activate the account
//     await page.goto(verificationLink);

//     // Now you can log in as normal (already in login mode)
//     await page.goto(routes.auth);
//     await page.fill(selectors.loginEmail, email);
//     await page.fill(selectors.loginPassword, password);
//     await page.click(selectors.loginSubmit);
//     await expect(page).toHaveURL(routes.app);
//     await expect(page.locator(selectors.appWelcome)).toBeVisible();
//   });
}); 