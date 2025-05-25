import { test, expect } from './utils/fixtures';
import { logoutUser, registerAndConfirmUser } from './utils/userFlows';

test.use({ storageState: { cookies: [], origins: [] } });

const routes = {
  auth: '/auth',
  app: '/app',
  subscribe: '/subscribe',
};

test.describe('Subscription Flows', () => {
  test('User can register, confirm email, and subscribe', async ({ page }) => {
    const { email, password } = await registerAndConfirmUser(page);
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

    // Optional: Log out and log back in to verify subscription state persists
    await logoutUser(page);
  }, 120000);
}); 