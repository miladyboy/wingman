# Test info

- Name: Route Guards >> Subscribed User >> [RedirectIfSubscribed] to /subscribe is redirected to /app
- Location: /Users/maurovelazquez/Code/harem/frontend/tests/e2e/guards.spec.ts:74:5

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: getByTestId('new-chat-button')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for getByTestId('new-chat-button')

    at /Users/maurovelazquez/Code/harem/frontend/tests/e2e/guards.spec.ts:78:57
```

# Page snapshot

```yaml
- heading "Subscribe to Harem" [level=2]
- paragraph: To access the app, please subscribe.
- button "Subscribe"
- button "Log out"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import { logoutUser } from './utils/userFlows';
   3 |
   4 | const routes = {
   5 |   auth: '/auth',
   6 |   app: '/app',
   7 |   subscribe: '/subscribe',
   8 |   landing: '/',
   9 | };
  10 |
  11 | test.describe('Route Guards', () => {
  12 |   test.describe('Authentication Guards (RequireAuth & RedirectIfAuth)', () => {
  13 |     test.use({ storageState: { cookies: [], origins: [] } });
  14 |
  15 |     test('unauthenticated user is redirected from /app to /landing', async ({ page }) => {
  16 |       await page.goto(routes.app);
  17 |       await expect(page).toHaveURL(routes.landing);
  18 |       await expect(page.getByTestId('landing-page-headline')).toContainText('Your Personal AI Wingman');
  19 |     });
  20 |   });
  21 |
  22 |   test.describe('Unsubscribed User (email verified, not subscribed)', () => {
  23 |     test.use({ storageState: 'playwright/.auth/emailVerifiedUser.json' });
  24 |
  25 |     test('access to /app is redirected to /subscribe', async ({ page }) => {
  26 |       await page.goto(routes.app);
  27 |       await expect(page).toHaveURL(routes.subscribe);
  28 |       await expect(page.getByTestId('proceed-to-checkout-button')).toBeVisible();
  29 |       await logoutUser(page);
  30 |       await expect(page).toHaveURL(routes.landing);
  31 |     });
  32 |
  33 |     test('from /landing is redirected to /subscribe', async ({ page }) => {
  34 |       await page.goto(routes.landing);
  35 |       await expect(page).toHaveURL(routes.subscribe, { timeout: 10000 });
  36 |       await expect(page.getByTestId('proceed-to-checkout-button')).toBeVisible();
  37 |       await logoutUser(page);
  38 |     });
  39 |
  40 |     test('from /auth is redirected to /subscribe', async ({ page }) => {
  41 |       await page.goto(routes.auth);
  42 |       await expect(page).toHaveURL(routes.subscribe, { timeout: 10000 });
  43 |       await expect(page.getByTestId('proceed-to-checkout-button')).toBeVisible();
  44 |       await logoutUser(page);
  45 |     });
  46 |
  47 |     test('[RequireSubscription] to /app is redirected to /subscribe', async ({ page }) => {
  48 |       await page.goto(routes.app);
  49 |       await expect(page).toHaveURL(routes.subscribe);
  50 |       await expect(page.getByTestId('proceed-to-checkout-button')).toBeVisible();
  51 |       await logoutUser(page);
  52 |     });
  53 |
  54 |     test('[RedirectIfSubscribed] can access /subscribe', async ({ page }) => {
  55 |       await page.goto(routes.subscribe);
  56 |       await expect(page).toHaveURL(routes.subscribe);
  57 |       await expect(page.getByTestId('proceed-to-checkout-button')).toBeVisible();
  58 |       await logoutUser(page);
  59 |     });
  60 |   });
  61 |
  62 |   test.describe('Subscribed User', () => {
  63 |     test.use({ storageState: 'playwright/.auth/subscribedUser.json' });
  64 |
  65 |     test('[RequireSubscription] can access /app', async ({ page }) => {
  66 |       await page.goto(routes.app);
  67 |       await page.waitForURL(routes.app, { timeout: 10000 });
  68 |       await expect(page).toHaveURL(routes.app);
  69 |       await expect(page.getByTestId('new-chat-button')).toBeVisible({ timeout: 10000 });
  70 |       await expect(page.getByTestId('user-info-display')).toBeVisible({ timeout: 10000 });
  71 |       await logoutUser(page);
  72 |     });
  73 |
  74 |     test('[RedirectIfSubscribed] to /subscribe is redirected to /app', async ({ page }) => {
  75 |       await page.goto(routes.subscribe);
  76 |       await page.waitForURL(routes.app, { timeout: 10000 });
  77 |       await expect(page).toHaveURL(routes.app);
> 78 |       await expect(page.getByTestId('new-chat-button')).toBeVisible({ timeout: 10000 });
     |                                                         ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
  79 |       await logoutUser(page);
  80 |     });
  81 |   });
  82 | }); 
```