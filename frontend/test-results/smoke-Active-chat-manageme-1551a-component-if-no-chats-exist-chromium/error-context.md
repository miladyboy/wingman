# Test info

- Name: Active chat management >> shows new chat component if no chats exist
- Location: /Users/maurovelazquez/Code/harem/frontend/tests/smoke.spec.ts:39:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('text=Start your new conversation by sending a message.')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('text=Start your new conversation by sending a message.')

    at /Users/maurovelazquez/Code/harem/frontend/tests/smoke.spec.ts:44:90
```

# Page snapshot

```yaml
- text: Sign In Sign in to your account via email and password Email
- textbox "Email"
- text: Password
- textbox "Password"
- button "Sign In"
- button "Need an account? Register"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | /**
   4 |  * Smoke test: Loads the homepage and checks for the main header loads.
   5 |  */
   6 | test('homepage loads and chat input is visible', async ({ page }) => {
   7 |   await page.goto('/');
   8 |   const headline = await page.locator('h1.font-headline');
   9 |   await expect(headline).toBeVisible();
  10 |   await expect(headline).toContainText('Your Personal AI Wingman');
  11 | });
  12 |
  13 | /**
  14 |  * Active chat management tests
  15 |  */
  16 | test.describe('Active chat management', () => {
  17 |   test('keeps last chat active after refresh', async ({ page }) => {
  18 |     // Simulate login and create two chats
  19 |     // This assumes test user and chat creation API or UI is available
  20 |     await page.goto('/auth');
  21 |     // ...simulate login steps...
  22 |     // ...simulate creating two chats...
  23 |     // Select the second chat
  24 |     // await page.click('text=Chat 2');
  25 |     // Refresh
  26 |     await page.reload();
  27 |     // The second chat should still be active
  28 |     // await expect(page.locator('h2')).toHaveText('Chat 2');
  29 |   });
  30 |
  31 |   test('shows first chat as active on login', async ({ page }) => {
  32 |     // Simulate login with at least one chat
  33 |     await page.goto('/auth');
  34 |     // ...simulate login steps...
  35 |     // The first chat should be active
  36 |     // await expect(page.locator('h2')).toHaveText('Chat 1');
  37 |   });
  38 |
  39 |   test('shows new chat component if no chats exist', async ({ page }) => {
  40 |     // Simulate login with no chats
  41 |     await page.goto('/auth');
  42 |     // ...simulate login steps for a new user...
  43 |     // Should see the new chat prompt
> 44 |     await expect(page.locator('text=Start your new conversation by sending a message.')).toBeVisible();
     |                                                                                          ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  45 |   });
  46 | }); 
```