import { test, expect } from './utils/fixtures';
import { logoutUser, loginUser, registerAndConfirmUser } from './utils/userFlows';

test.use({ storageState: { cookies: [], origins: [] } });

const routes = {
  auth: '/auth',
  app: '/app',
  subscribe: '/subscribe',
};

test.describe('Supabase Auth Flows', () => {
  test('User can register, confirm email, logout, and login', async ({ page }) => {
    const { email, password } = await registerAndConfirmUser(page);
    await expect(page).toHaveURL(routes.subscribe);

    await logoutUser(page);

    await expect(page).toHaveURL('/');

    await loginUser(page, email, password);

    await expect(page).toHaveURL(routes.subscribe);
  });

  test('should access protected route as email verified user', async ({ emailVerifiedUserPage }) => {
    await emailVerifiedUserPage.goto('/subscribe');
    await expect(emailVerifiedUserPage.locator('[data-testid="proceed-to-checkout-button"]')).toBeVisible();
  });

  test('should access app as subscribed user', async ({ subscribedUserPage }) => {
    await subscribedUserPage.goto('/app');
    await expect(
      subscribedUserPage.locator('[data-testid="new-chat-button"], nav button:has-text("+ New Chat")').first()
    ).toBeVisible();
  });
});
