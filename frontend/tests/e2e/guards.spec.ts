import { test, expect, Browser } from '@playwright/test';
import {
  registerAndConfirmUser,
  logoutUser,
  completeSubscription,
  loginUser,
  UserCredentials,
} from './utils/userFlows';

const routes = {
  auth: '/auth',
  app: '/app',
  subscribe: '/subscribe',
  landing: '/',
};

const selectors = {
  landingPageHeadline: '[data-testid="landing-page-headline"]',
  newChatButton: '[data-testid="new-chat-button"]',
  userInfoDisplay: '[data-testid="user-info-display"]',
  proceedToCheckoutButton: '[data-testid="proceed-to-checkout-button"]',
};

let unsubscribedUserCredentials: UserCredentials;
let subscribedUserCredentials: UserCredentials;

test.beforeAll(async ({ browser }: { browser: Browser }) => {
  const setupPage = await browser.newPage();
  // Create unsubscribed user
  console.log('Setting up unsubscribed user...');
  unsubscribedUserCredentials = await registerAndConfirmUser(setupPage, { usernamePrefix: 'unsub' });
  // registerAndConfirmUser should land on /subscribe, then we log out.
  await expect(setupPage).toHaveURL(routes.subscribe);
  await logoutUser(setupPage);
  await expect(setupPage).toHaveURL(routes.landing);
  console.log('Unsubscribed user setup complete.');

  // Create subscribed user
  console.log('Setting up subscribed user...');
  subscribedUserCredentials = await registerAndConfirmUser(setupPage, { usernamePrefix: 'sub' });
  await expect(setupPage).toHaveURL(routes.subscribe); // Should be on /subscribe before completing
  await completeSubscription(setupPage);
  await expect(setupPage).toHaveURL(routes.app); // Should be on /app after subscription
  await logoutUser(setupPage);
  await expect(setupPage).toHaveURL(routes.landing);
  console.log('Subscribed user setup complete.');

  await setupPage.close();
});

/**
 * E2E: Route Guards
 */
test.describe('Route Guards', () => {
  test.describe('Authentication Guards (RequireAuth & RedirectIfAuth)', () => {
    test('unauthenticated user is redirected from /app to /landing', async ({ page }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.landing);
      await expect(page.locator(selectors.landingPageHeadline)).toContainText('Your Personal AI Wingman');
    });

    test('authenticated, unsubscribed user access to /app is redirected to /subscribe', async ({ page }) => {
      await loginUser(page, unsubscribedUserCredentials.email, unsubscribedUserCredentials.password);
      await expect(page).toHaveURL(routes.subscribe); // Login for unsubscribed user lands on /subscribe
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();

      await page.goto(routes.app); // Attempt to access /app
      await expect(page).toHaveURL(routes.subscribe); // Should be redirected back by RequireSubscription
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();

      await logoutUser(page);
      await expect(page).toHaveURL(routes.landing);
    });

    test('authenticated, unsubscribed user from /landing is redirected to /subscribe', async ({ page }) => {
      await loginUser(page, unsubscribedUserCredentials.email, unsubscribedUserCredentials.password);
      await expect(page).toHaveURL(routes.subscribe);

      await page.goto(routes.landing);
      await expect(page).toHaveURL(routes.subscribe, { timeout: 10000 });
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();

      await logoutUser(page);
    });

    test('authenticated, unsubscribed user from /auth is redirected to /subscribe', async ({ page }) => {
      await loginUser(page, unsubscribedUserCredentials.email, unsubscribedUserCredentials.password);
      await expect(page).toHaveURL(routes.subscribe);

      await page.goto(routes.auth);
      await expect(page).toHaveURL(routes.subscribe, { timeout: 10000 });
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();

      await logoutUser(page);
    });
  });

  // Placeholder for Subscription Guard tests
  test.describe('Subscription Guards (RequireSubscription & RedirectIfSubscribed)', () => {
    test('[RequireSubscription] Authenticated, Unsubscribed User to /app is redirected to /subscribe', async ({ page }) => {
      await loginUser(page, unsubscribedUserCredentials.email, unsubscribedUserCredentials.password);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();

      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();

      await logoutUser(page);
    });

    test('[RequireSubscription] Authenticated, Subscribed User can access /app', async ({ page }) => {
      await loginUser(page, subscribedUserCredentials.email, subscribedUserCredentials.password);
      await expect(page).toHaveURL(routes.app); // Login for subscribed user lands on /app
      
      await expect(page.locator(selectors.newChatButton)).toBeVisible();
      await expect(page.locator(selectors.userInfoDisplay)).toBeVisible();

      // Verify direct navigation to /app also works
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.app);
      await expect(page.locator(selectors.newChatButton)).toBeVisible();

      await logoutUser(page);
    });

    test('[RedirectIfSubscribed] Authenticated, Subscribed User to /subscribe is redirected to /app', async ({ page }) => {
      await loginUser(page, subscribedUserCredentials.email, subscribedUserCredentials.password);
      await expect(page).toHaveURL(routes.app);

      await page.goto(routes.subscribe);
      await expect(page).toHaveURL(routes.app);
      await expect(page.locator(selectors.newChatButton)).toBeVisible();

      await logoutUser(page);
    });

    test('[RedirectIfSubscribed] Authenticated, Unsubscribed User can access /subscribe', async ({ page }) => {
      await loginUser(page, unsubscribedUserCredentials.email, unsubscribedUserCredentials.password);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();
      
      // Verify direct navigation also works
      await page.goto(routes.subscribe);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();

      await logoutUser(page);
    });
  });
}); 