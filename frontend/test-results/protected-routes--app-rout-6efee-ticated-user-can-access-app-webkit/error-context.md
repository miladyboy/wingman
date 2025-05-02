# Test info

- Name: /app route protection >> authenticated user can access /app
- Location: /Users/maurovelazquez/Code/harem/frontend/tests/protected-routes.spec.ts:17:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/app" until "load"
============================================================
    at /Users/maurovelazquez/Code/harem/frontend/tests/protected-routes.spec.ts:24:16
```

# Page snapshot

```yaml
- text: Sign In Sign in to your account via email and password
- alert:
  - heading "Error" [level=5]
  - text: Invalid login credentials
- text: Email
- textbox "Email": testuser@example.com
- text: Password
- textbox "Password": testpassword
- button "Sign In"
- button "Need an account? Register"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | const TEST_USER_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || 'testuser@example.com';
   4 | const TEST_USER_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD || 'testpassword';
   5 |
   6 | /**
   7 |  * E2E: Protected Route /app
   8 |  */
   9 | test.describe('/app route protection', () => {
  10 |   test('unauthenticated user is redirected from /app to /', async ({ page }) => {
  11 |     await page.goto('/app');
  12 |     // Should be redirected to landing page ("/"), which contains a known element
  13 |     await expect(page).toHaveURL('/');
  14 |     await expect(page.locator('h1.font-headline')).toContainText('Your Personal AI Wingman');
  15 |   });
  16 |
  17 |   test('authenticated user can access /app', async ({ page }) => {
  18 |     // Go to auth page and log in
  19 |     await page.goto('/auth');
  20 |     await page.fill('input[type="email"]', TEST_USER_EMAIL);
  21 |     await page.fill('input[type="password"]', TEST_USER_PASSWORD);
  22 |     await page.click('button[type="submit"]');
  23 |     // Wait for redirect to /app
> 24 |     await page.waitForURL('/app', { timeout: 10000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  25 |     // Check for main app UI (sidebar, chat, etc.)
  26 |     await expect(page.locator('button', { hasText: '+ New Chat' })).toBeVisible();
  27 |     await expect(page.locator('div')).toContainText('Logged in as');
  28 |   });
  29 | }); 
```