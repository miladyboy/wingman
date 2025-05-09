import { test, expect } from '@playwright/test';
import { logoutUser } from './utils/userFlows';

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

test.describe('Route Guards', () => {
  test.describe('Authentication Guards (RequireAuth & RedirectIfAuth)', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('unauthenticated user is redirected from /app to /landing', async ({ page }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.landing);
      await expect(page.locator(selectors.landingPageHeadline)).toContainText('Your Personal AI Wingman');
    });
  });

  test.describe('Unsubscribed User (email verified, not subscribed)', () => {
    test.use({ storageState: 'playwright/.auth/emailVerifiedUser.json' });

    test('access to /app is redirected to /subscribe', async ({ page }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();
      await logoutUser(page);
      await expect(page).toHaveURL(routes.landing);
    });

    test('from /landing is redirected to /subscribe', async ({ page }) => {
      await page.goto(routes.landing);
      await expect(page).toHaveURL(routes.subscribe, { timeout: 10000 });
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();
      await logoutUser(page);
    });

    test('from /auth is redirected to /subscribe', async ({ page }) => {
      await page.goto(routes.auth);
      await expect(page).toHaveURL(routes.subscribe, { timeout: 10000 });
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();
      await logoutUser(page);
    });

    test('[RequireSubscription] to /app is redirected to /subscribe', async ({ page }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();
      await logoutUser(page);
    });

    test('[RedirectIfSubscribed] can access /subscribe', async ({ page }) => {
      await page.goto(routes.subscribe);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(page.locator(selectors.proceedToCheckoutButton)).toBeVisible();
      await logoutUser(page);
    });
  });

  test.describe('Subscribed User', () => {
    test.use({ storageState: 'playwright/.auth/subscribedUser.json' });

    test('[RequireSubscription] can access /app', async ({ page }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.app);
      await expect(page.locator(selectors.newChatButton)).toBeVisible();
      await expect(page.locator(selectors.userInfoDisplay)).toBeVisible();
      await logoutUser(page);
    });

    test('[RedirectIfSubscribed] to /subscribe is redirected to /app', async ({ page }) => {
      await page.goto(routes.subscribe);
      await expect(page).toHaveURL(routes.app);
      await expect(page.locator(selectors.newChatButton)).toBeVisible();
      await logoutUser(page);
    });
  });
}); 