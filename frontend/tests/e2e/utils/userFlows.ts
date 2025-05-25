import { Page } from '@playwright/test';
import { getConfirmationLink } from './mailtrap';

const routes = {
  auth: '/auth',
  app: '/app',
  subscribe: '/subscribe',
  landing: '/',
};

const selectors = {
  // Registration
  toggleToRegister: 'text=Need an account? Register',
  registerUsername: '[data-testid="register-username"]',
  registerEmail: '[data-testid="register-email"]',
  registerPassword: '[data-testid="register-password"]',
  registerSubmit: '[data-testid="register-submit"]',
  // Login
  loginEmail: '[data-testid="login-email"]',
  loginPassword: '[data-testid="login-password"]',
  loginSubmit: '[data-testid="login-submit"]',
  // Subscription
  proceedToCheckoutButton: '[data-testid="proceed-to-checkout-button"]',
  // Main App / Logout
};

export function generateUniqueEmail(prefix = 'e2euser') {
  return `${prefix}+${Date.now()}@example.com`;
}

export const TEST_PASSWORD = 'TestPassword123!';

export interface UserCredentials {
  email: string;
  password: string;
  username: string;
}

/**
 * Registers a new user and confirms their email.
 * Assumes Mailtrap is set up correctly and accessible.
 *
 * @param page Playwright Page object
 * @param options Optional parameters.
 * @param options.usernamePrefix Prefix for the generated username. Defaults to 'user'.
 * @returns {Promise<UserCredentials>} The credentials of the registered user.
 */
export async function registerAndConfirmUser(
  page: Page,
  { usernamePrefix = 'user' }: { usernamePrefix?: string } = {}
): Promise<UserCredentials> {
  const email = generateUniqueEmail();
  const username = `${usernamePrefix}${Date.now()}`;

  // Navigate to auth page and switch to registration form
  await page.goto(routes.auth);
  await page.click(selectors.toggleToRegister);

  // Fill out registration form
  await page.fill(selectors.registerUsername, username);
  await page.fill(selectors.registerEmail, email);
  await page.fill(selectors.registerPassword, TEST_PASSWORD);
  await page.click(selectors.registerSubmit);

  // Wait for the confirmation email to be processed by Mailtrap and our app to send it.
  // This timeout might need adjustment based on email sending/receiving speed.
  await page.waitForTimeout(5000); // Increased timeout for email arrival

  // Fetch the confirmation link from Mailtrap
  const confirmationLink = await getConfirmationLink(email);
  if (!confirmationLink) {
    throw new Error('Could not retrieve confirmation link from Mailtrap.');
  }

  // Visit the confirmation link
  // Supabase confirmation often redirects to the site root or a specific redirect URL.
  // The frontend router then takes over.
  await page.goto(confirmationLink);

  // After confirmation, the user is usually auto-logged in.
  // We expect to be redirected to the /subscribe page for a new, unsubscribed user.
  await page.waitForURL(`**${routes.subscribe}`, { timeout: 15000 }); // Increased timeout

  return { email, password: TEST_PASSWORD, username };
}

/**
 * Logs in an existing user.
 *
 * @param page Playwright Page object
 * @param email User's email
 * @param password User's password
 */
export async function loginUser(page: Page, email: string, password = TEST_PASSWORD): Promise<void> {
  await page.goto(routes.auth);
  await page.fill(selectors.loginEmail, email);
  await page.fill(selectors.loginPassword, password);
  await page.click(selectors.loginSubmit);

  // After login, a subscribed user goes to /app, an unsubscribed user to /subscribe.
  // We can't be certain here, so we'll wait for either, or a more generic indicator of login.
  // For now, let's assume we check this in the calling test.
  // A more robust way would be to check for an element that appears on either page post-login.
  // For guard tests, the specific redirect IS what we're testing, so the test itself will assert the URL.
  await page.waitForURL(/\/(app|subscribe)/, { timeout: 10000 });
}

/**
 * Completes the subscription process for a logged-in user.
 * Assumes the user is on the /subscribe page.
 *
 * @param page Playwright Page object
 */
export async function completeSubscription(page: Page): Promise<void> {
  // Ensure we are on the subscribe page (or the button won't be there)
  if (!page.url().includes(routes.subscribe)) {
    await page.goto(routes.subscribe);
    await page.waitForURL(`**${routes.subscribe}`);
  }
  
  await page.click(selectors.proceedToCheckoutButton);
  await page.waitForURL('**/checkout.stripe.com/**');

  await page.getByRole('textbox', { name: 'Card number' }).fill('4242424242424242');
  await page.getByRole('textbox', { name: 'Expiration' }).fill('1230'); // MMYY
  await page.getByRole('textbox', { name: 'CVC' }).fill('123');
  await page.getByRole('textbox', { name: 'Cardholder name' }).fill('Test User');
  
  await page.getByTestId('hosted-payment-submit-button').click();

  // Wait for redirection back to the /app page upon successful subscription
  await page.waitForURL(`**${routes.app}`, { timeout: 20000 }); // Increased timeout for Stripe processing
}

/**
 * Logs out the current user.
 * Assumes the user is logged in and on a page with a logout button (e.g., /app or /subscribe).
 *
 * @param page Playwright Page object
 */
export async function logoutUser(page: Page): Promise<void> {
  // Open the profile menu
  await page.getByTestId('profile-menu-button').click();
  // Wait for the dropdown to appear
  await page.getByTestId('profile-menu-dropdown').waitFor({ state: 'visible', timeout: 5000 });
  // Click the logout button in the dropdown
  await page.getByTestId('profile-menu-logout').click();
  // Wait for redirect to landing page
  await page.waitForURL('**/', { timeout: 10000 });
} 