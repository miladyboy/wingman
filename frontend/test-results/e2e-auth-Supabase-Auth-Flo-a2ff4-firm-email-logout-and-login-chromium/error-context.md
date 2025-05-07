# Test info

- Name: Supabase Auth Flows >> User can register, confirm email, logout, and login
- Location: /Users/maurovelazquez/Code/harem/frontend/tests/e2e/auth.spec.ts:33:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected string: "http://localhost:5173/app"
Received string: "http://localhost:5173/subscribe"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="en">…</html>
      - unexpected value "http://localhost:5173/subscribe"

    at /Users/maurovelazquez/Code/harem/frontend/tests/e2e/auth.spec.ts:63:24
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
   2 | import { getConfirmationLink } from './utils/mailtrap';
   3 |
   4 | // Utility to generate a unique email for each test run
   5 | function generateUniqueEmail() {
   6 |   return `e2euser+${Date.now()}@example.com`;
   7 | }
   8 |
   9 | const password = 'TestPassword123!';
   10 |
   11 | const routes = {
   12 |   auth: '/auth',
   13 |   app: '/app',
   14 |   subscribe: '/subscribe',
   15 | };
   16 |
   17 | const selectors = {
   18 |   registerUsername: '[data-testid="register-username"]',
   19 |   registerEmail: '[data-testid="register-email"]',
   20 |   registerPassword: '[data-testid="register-password"]',
   21 |   registerSubmit: '[data-testid="register-submit"]',
   22 |   loginEmail: '[data-testid="login-email"]',
   23 |   loginPassword: '[data-testid="login-password"]',
   24 |   loginSubmit: '[data-testid="login-submit"]',
   25 |   logoutButton: '[data-testid="logout-button"]',
   26 |   appWelcome: '[data-testid="welcome-message"]',
   27 |   checkEmailMessage: '[data-testid="check-email-message"]',
   28 |   toggleToRegister: 'text=Need an account? Register',
   29 |   toggleToLogin: 'text=Already have an account? Sign In',
   30 | };
   31 |
   32 | test.describe('Supabase Auth Flows', () => {
   33 |   test('User can register, confirm email, logout, and login', async ({ page }) => {
   34 |     const email = generateUniqueEmail();
   35 |     const username = `user${Date.now()}`;
   36 |     // Register
   37 |     await page.goto(routes.auth);
   38 |     await page.click(selectors.toggleToRegister);
   39 |     await page.fill(selectors.registerUsername, username);
   40 |     await page.fill(selectors.registerEmail, email);
   41 |     await page.fill(selectors.registerPassword, password);
   42 |     await page.click(selectors.registerSubmit);
   43 |     // Wait for the confirmation email to arrive
   44 |     await page.waitForTimeout(4000); // Consider polling for robustness
   45 |     // Fetch the confirmation link from Mailtrap
   46 |     const confirmationLink = await getConfirmationLink();
   47 |     expect(confirmationLink).toBeTruthy();
   48 |     // Visit the confirmation link (lands on /, then frontend redirects to /subscribe)
   49 |     await page.goto(confirmationLink);
   50 |     // Wait for the frontend to redirect to /subscribe
   51 |     await page.waitForURL('**/subscribe');
   52 |     await expect(page).toHaveURL(routes.subscribe);
   53 |     // Log out
   54 |     if (await page.locator(selectors.logoutButton).count() > 0) {
   55 |       await page.click(selectors.logoutButton);
   56 |     }
   57 |     await expect(page).toHaveURL('/');
   58 |     // Login
   59 |     await page.goto(routes.auth);
   60 |     await page.fill(selectors.loginEmail, email);
   61 |     await page.fill(selectors.loginPassword, password);
   62 |     await page.click(selectors.loginSubmit);
>  63 |     await expect(page).toHaveURL(routes.app);
      |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
   64 |     await expect(page.locator(selectors.appWelcome)).toBeVisible();
   65 |   });
   66 |
   67 | //   test('User can logout', async ({ page }) => {
   68 | //     // Register and login a user first
   69 | //     const email = generateUniqueEmail();
   70 | //     const username = `user${Date.now()}`;
   71 | //     await page.goto(routes.auth);
   72 | //     await page.click(selectors.toggleToRegister);
   73 | //     await page.fill(selectors.registerUsername, username);
   74 | //     await page.fill(selectors.registerEmail, email);
   75 | //     await page.fill(selectors.registerPassword, password);
   76 | //     await page.click(selectors.registerSubmit);
   77 | //     await expect(page).toHaveURL(routes.app);
   78 | //     // Now logout
   79 | //     if (await page.locator(selectors.logoutButton).count() > 0) {
   80 | //       await page.click(selectors.logoutButton);
   81 | //     }
   82 | //     await expect(page).toHaveURL(routes.auth);
   83 | //     // Optionally, check for login form
   84 | //     await expect(page.locator(selectors.loginEmail)).toBeVisible();
   85 | //   });
   86 |
   87 | //   test('User can register, verify email, and login (with MailHog)', async ({ page }) => {
   88 | //     const email = generateUniqueEmail();
   89 | //     const username = `user${Date.now()}`;
   90 | //     await page.goto(routes.auth);
   91 | //     await page.click(selectors.toggleToRegister);
   92 | //     await page.fill(selectors.registerUsername, username);
   93 | //     await page.fill(selectors.registerEmail, email);
   94 | //     await page.fill(selectors.registerPassword, password);
   95 | //     await page.click(selectors.registerSubmit);
   96 | //     // Wait for "check your email" message
   97 | //     await expect(page.locator(selectors.checkEmailMessage)).toBeVisible();
   98 |
   99 | //     // Poll MailHog for the verification email and extract the link
  100 | //     const verificationLink = await getVerificationLink(email);
  101 |
  102 | //     // Visit the verification link to activate the account
  103 | //     await page.goto(verificationLink);
  104 |
  105 | //     // Now you can log in as normal (already in login mode)
  106 | //     await page.goto(routes.auth);
  107 | //     await page.fill(selectors.loginEmail, email);
  108 | //     await page.fill(selectors.loginPassword, password);
  109 | //     await page.click(selectors.loginSubmit);
  110 | //     await expect(page).toHaveURL(routes.app);
  111 | //     await expect(page.locator(selectors.appWelcome)).toBeVisible();
  112 | //   });
  113 | }); 
```