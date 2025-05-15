import { test, expect } from '@playwright/test';
import {  logoutUser, loginUser, registerAndConfirmUser } from './utils/userFlows';

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
}); 