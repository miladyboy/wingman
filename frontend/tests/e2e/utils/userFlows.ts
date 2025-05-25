import { Page } from "@playwright/test";
import { getConfirmationLink } from "./mailtrap";
import { logStep, logError, logDebug } from "./logger";

const routes = {
  auth: "/auth",
  app: "/app",
  subscribe: "/subscribe",
  landing: "/",
};

const selectors = {
  // Registration
  toggleToRegister: "text=Need an account? Register",
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

export function generateUniqueEmail(prefix = "e2euser") {
  // Add more entropy to prevent collisions in parallel runs
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const email = `${prefix}+${timestamp}+${random}@example.com`;
  logDebug("Generated unique email", { email, prefix, timestamp, random });
  return email;
}

export const TEST_PASSWORD = "TestPassword123!";

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
  { usernamePrefix = "user" }: { usernamePrefix?: string } = {}
): Promise<UserCredentials> {
  const email = generateUniqueEmail();
  const username = `${usernamePrefix}${Date.now()}${Math.random()
    .toString(36)
    .substring(2, 4)}`;

  logStep("Starting user registration", { email, username, usernamePrefix });

  try {
    // Navigate to auth page and switch to registration form
    logDebug("Navigating to auth page");
    await page.goto(routes.auth);
    await page.click(selectors.toggleToRegister);

    // Fill out registration form
    logDebug("Filling registration form", { email, username });
    await page.fill(selectors.registerUsername, username);
    await page.fill(selectors.registerEmail, email);
    await page.fill(selectors.registerPassword, TEST_PASSWORD);

    logDebug("Submitting registration form");
    await page.click(selectors.registerSubmit);

    // Wait for the confirmation email to be processed by Mailtrap and our app to send it.
    logStep("Waiting for email to arrive", { waitTime: "5000ms" });
    await page.waitForTimeout(5000);

    // Fetch the confirmation link from Mailtrap
    logStep("Fetching confirmation link from Mailtrap", { email });
    const confirmationLink = await getConfirmationLink(email);
    if (!confirmationLink) {
      throw new Error("Could not retrieve confirmation link from Mailtrap.");
    }
    logDebug("Retrieved confirmation link", { confirmationLink });

    // Visit the confirmation link
    logStep("Visiting confirmation link");
    await page.goto(confirmationLink);

    // Check current URL before waiting
    const currentUrl = page.url();
    logDebug("Current URL after confirmation link visit", { currentUrl });

    // After confirmation, the user is usually auto-logged in.
    // We expect to be redirected to the /subscribe page for a new, unsubscribed user.
    logStep("Waiting for redirect to subscribe page", {
      expectedUrl: routes.subscribe,
      timeout: "60s",
    });
    await page.waitForURL(`**${routes.subscribe}`, { timeout: 60000 });

    logStep("User registration and confirmation completed successfully", {
      email,
      username,
    });
    return { email, password: TEST_PASSWORD, username };
  } catch (error) {
    logError("Registration and confirmation failed", {
      email,
      username,
      error: error instanceof Error ? error.message : String(error),
      currentUrl: page.url(),
    });
    throw error;
  }
}

/**
 * Logs in an existing user.
 *
 * @param page Playwright Page object
 * @param email User's email
 * @param password User's password
 */
export async function loginUser(
  page: Page,
  email: string,
  password = TEST_PASSWORD
): Promise<void> {
  logStep("Starting user login", { email });

  try {
    await page.goto(routes.auth);
    await page.fill(selectors.loginEmail, email);
    await page.fill(selectors.loginPassword, password);

    logDebug("Submitting login form");
    await page.click(selectors.loginSubmit);

    // After login, a subscribed user goes to /app, an unsubscribed user to /subscribe.
    logStep("Waiting for post-login redirect", { timeout: "15s" });
    await page.waitForURL(/\/(app|subscribe)/, { timeout: 15000 });

    const finalUrl = page.url();
    logStep("Login completed successfully", { email, finalUrl });
  } catch (error) {
    logError("Login failed", {
      email,
      error: error instanceof Error ? error.message : String(error),
      currentUrl: page.url(),
    });
    throw error;
  }
}

/**
 * Completes the subscription process for a logged-in user.
 * Assumes the user is on the /subscribe page.
 *
 * @param page Playwright Page object
 */
export async function completeSubscription(page: Page): Promise<void> {
  logStep("Starting subscription process");

  try {
    // Ensure we are on the subscribe page (or the button won't be there)
    if (!page.url().includes(routes.subscribe)) {
      logDebug("Navigating to subscribe page");
      await page.goto(routes.subscribe);
      await page.waitForURL(`**${routes.subscribe}`, { timeout: 60000 });
    }

    logDebug("Clicking proceed to checkout button");
    await page.click(selectors.proceedToCheckoutButton);

    logStep("Waiting for Stripe checkout page");
    await page.waitForURL("**/checkout.stripe.com/**", { timeout: 60000 });

    logDebug("Filling Stripe payment form");
    await page
      .getByRole("textbox", { name: "Card number" })
      .fill("4242424242424242");
    await page.getByRole("textbox", { name: "Expiration" }).fill("1230");
    await page.getByRole("textbox", { name: "CVC" }).fill("123");
    await page
      .getByRole("textbox", { name: "Cardholder name" })
      .fill("Test User");

    logDebug("Submitting Stripe payment");
    await page.getByTestId("hosted-payment-submit-button").click();

    logStep("Waiting for redirect to app after subscription");
    await page.waitForURL(`**${routes.app}`, { timeout: 60000 });

    logStep("Subscription completed successfully");
  } catch (error) {
    logError("Subscription process failed", {
      error: error instanceof Error ? error.message : String(error),
      currentUrl: page.url(),
    });
    throw error;
  }
}

/**
 * Logs out the current user.
 * Assumes the user is logged in and on a page with a logout button (e.g., /app or /subscribe).
 *
 * @param page Playwright Page object
 */
export async function logoutUser(page: Page): Promise<void> {
  logStep("Starting user logout");

  try {
    // Open the profile menu
    await page.getByTestId("profile-menu-button").click();
    // Wait for the dropdown to appear
    await page
      .getByTestId("profile-menu-dropdown")
      .waitFor({ state: "visible", timeout: 5000 });
    // Click the logout button in the dropdown
    await page.getByTestId("profile-menu-logout").click();
    // Wait for redirect to landing page
    await page.waitForURL("**/", { timeout: 60000 });

    logStep("Logout completed successfully");
  } catch (error) {
    logError("Logout failed", {
      error: error instanceof Error ? error.message : String(error),
      currentUrl: page.url(),
    });
    throw error;
  }
}
