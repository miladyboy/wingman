import { test, expect } from '@playwright/test';
import { logoutUser } from './utils/userFlows';

const routes = {
  auth: '/auth',
  app: '/app',
  subscribe: '/subscribe',
  landing: '/',
};

test.describe('Route Guards', () => {
  test.describe('Authentication Guards (RequireAuth & RedirectIfAuth)', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('unauthenticated user is redirected from /app to /landing', async ({ page }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.landing);
      await expect(page.getByTestId('landing-page-headline')).toContainText('Turn every DM into a date');
    });
  });

  test.describe('Unsubscribed User (email verified, not subscribed)', () => {
    test.use({ storageState: 'playwright/.auth/emailVerifiedUser.json' });

    test('access to /app is redirected to /subscribe', async ({ page }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(page.getByTestId('proceed-to-checkout-button')).toBeVisible();
      await logoutUser(page);
      await expect(page).toHaveURL(routes.landing);
    });

    test('from /landing is redirected to /subscribe', async ({ page }) => {
      await page.goto(routes.landing);
      await expect(page).toHaveURL(routes.subscribe, { timeout: 10000 });
      await expect(page.getByTestId('proceed-to-checkout-button')).toBeVisible();
      await logoutUser(page);
    });

    test('from /auth is redirected to /subscribe', async ({ page }) => {
      await page.goto(routes.auth);
      await expect(page).toHaveURL(routes.subscribe, { timeout: 10000 });
      await expect(page.getByTestId('proceed-to-checkout-button')).toBeVisible();
      await logoutUser(page);
    });

    test('[RequireSubscription] to /app is redirected to /subscribe', async ({ page }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(page.getByTestId('proceed-to-checkout-button')).toBeVisible();
      await logoutUser(page);
    });

    test('[RedirectIfSubscribed] can access /subscribe', async ({ page }) => {
      await page.goto(routes.subscribe);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(page.getByTestId('proceed-to-checkout-button')).toBeVisible();
      await logoutUser(page);
    });
  });

  test.describe('Subscribed User', () => {
    test.use({ storageState: 'playwright/.auth/subscribedUser.json' });

    test('[RequireSubscription] can access /app', async ({ page }) => {
      await page.goto(routes.app);
      await page.waitForURL(routes.app, { timeout: 10000 });
      await expect(page).toHaveURL(routes.app);
      await expect(page.getByTestId('new-chat-button')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId('user-info-display')).toBeVisible({ timeout: 10000 });
      await logoutUser(page);
    });

    test('[RedirectIfSubscribed] to /subscribe is redirected to /app', async ({ page }) => {
      await page.goto(routes.subscribe);
      await page.waitForURL(routes.app, { timeout: 10000 });
      await expect(page).toHaveURL(routes.app);
      await expect(page.getByTestId('new-chat-button')).toBeVisible({ timeout: 10000 });
      await logoutUser(page);
    });
  });
}); 