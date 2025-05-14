import { test, expect } from '@playwright/test';
import { getConfirmationLink } from './utils/mailtrap';
import { generateUniqueEmail, TEST_PASSWORD } from './utils/userFlows';

test.use({ storageState: { cookies: [], origins: [] } });

const routes = {
  auth: '/auth',
  app: '/app',
  subscribe: '/subscribe',
};

test.describe('Subscription Flows', () => {
  test('User can register, confirm email, and subscribe', async ({ page }) => {
    const email = generateUniqueEmail();
    const username = `user${Date.now()}`;
    // Register
    await page.goto(routes.auth);
    await page.getByText('Need an account? Register').click();
    await page.getByTestId('register-username').fill(username);
    await page.getByTestId('register-email').fill(email);
    await page.getByTestId('register-password').fill(TEST_PASSWORD);
    await page.getByTestId('register-submit').click();
    // Wait for the confirmation email to arrive
    await page.waitForTimeout(4000); // Consider polling for robustness
    // Fetch the confirmation link from Mailtrap
    const confirmationLink = await getConfirmationLink();
    expect(confirmationLink).toBeTruthy();
    // Visit the confirmation link (lands on /, then frontend redirects to /subscribe)
    await page.goto(confirmationLink);
    // Wait for the frontend to redirect to /subscribe
    await page.waitForURL('**/subscribe');
    await expect(page).toHaveURL(routes.subscribe);
   
    // Click the button to proceed to Stripe Checkout
    await page.getByTestId('proceed-to-checkout-button').click();

    // Wait for navigation to Stripe's checkout page
    await page.waitForURL('**/checkout.stripe.com/**');

    // Fill in Stripe's test payment details using getByRole selectors
    await page.getByRole('textbox', { name: 'Card number' }).fill('4242424242424242');
    await page.getByRole('textbox', { name: 'Expiration' }).fill('1230'); // MMYY format
    await page.getByRole('textbox', { name: 'CVC' }).fill('123');
    await page.getByRole('textbox', { name: 'Cardholder name' }).fill('Test User');
    
    // Click the pay button on Stripe's page using the provided test ID
    await page.getByTestId('hosted-payment-submit-button').click();

    await page.waitForURL(`**${routes.app}`);
    await expect(page).toHaveURL(routes.app);

    // Wait for the main app page to be ready by checking for user info display
    await expect(page.getByTestId('user-info-display')).toBeVisible({ timeout: 15000 });

    // Optional: Log out and log back in to verify subscription state persists
    await expect(page.getByTestId('logout-button')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('logout-button').click();
  }, 120000);
}); 