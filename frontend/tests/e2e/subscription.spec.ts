import { test, expect } from '@playwright/test';
import { getConfirmationLink } from './utils/mailtrap';

function generateUniqueEmail() {
  return `e2euser+${Date.now()}@example.com`;
}

const password = 'TestPassword123!';

const routes = {
  auth: '/auth',
  app: '/app',
  subscribe: '/subscribe',
};

const selectors = {
  registerUsername: '[data-testid="register-username"]',
  registerEmail: '[data-testid="register-email"]',
  registerPassword: '[data-testid="register-password"]',
  registerSubmit: '[data-testid="register-submit"]',
  loginEmail: '[data-testid="login-email"]',
  loginPassword: '[data-testid="login-password"]',
  loginSubmit: '[data-testid="login-submit"]',
  logoutButton: '[data-testid="logout-button"]',
  toggleToRegister: 'text=Need an account? Register',
  stripePaymentElement: '[data-testid="stripe-payment-element"]',
  stripeSubmitButton: '[data-testid="stripe-submit-button"]',
  subscriptionSuccessMessage: '[data-testid="subscription-success-message"]',
  proceedToCheckoutButton: '[data-testid="proceed-to-checkout-button"]',
  userInfoDisplay: '[data-testid="user-info-display"]',
};

test.describe('Subscription Flows', () => {
  test('User can register, confirm email, and subscribe', async ({ page }) => {
    const email = generateUniqueEmail();
    const username = `user${Date.now()}`;
    // Register
    await page.goto(routes.auth);
    await page.click(selectors.toggleToRegister);
    await page.fill(selectors.registerUsername, username);
    await page.fill(selectors.registerEmail, email);
    await page.fill(selectors.registerPassword, password);
    await page.click(selectors.registerSubmit);
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
    await page.click(selectors.proceedToCheckoutButton);

    // Wait for navigation to Stripe's checkout page
    // The URL will typically be something like https://checkout.stripe.com/...
    await page.waitForURL('**/checkout.stripe.com/**');

    // Fill in Stripe's test payment details using getByRole selectors
    // Email might be pre-filled. If not, find its accessible name.
    // await page.getByRole('textbox', { name: 'Email' }).fill(email);

    await page.getByRole('textbox', { name: 'Card number' }).fill('4242424242424242');
    await page.getByRole('textbox', { name: 'Expiration' }).fill('1230'); // MMYY format
    await page.getByRole('textbox', { name: 'CVC' }).fill('123');
    await page.getByRole('textbox', { name: 'Cardholder name' }).fill('Test User');
    
    // Example for postal code if it appears (verify accessible name):
    // const postalCodeField = page.getByRole('textbox', { name: /Postal code|ZIP/i });
    // if (await postalCodeField.isVisible()) {
    //   await postalCodeField.fill('90210');
    // }

    // Click the pay button on Stripe's page using the provided test ID
    await page.getByTestId('hosted-payment-submit-button').click();

    // Wait for redirection back to your application
    // This URL depends on your Stripe Checkout configuration (success_url)
    // Assuming it redirects to the /app page upon successful subscription
    await page.waitForURL(`**${routes.app}`);
    await expect(page).toHaveURL(routes.app);

    // Wait for the main app page to be ready by checking for user info display
    await expect(page.locator(selectors.userInfoDisplay)).toBeVisible({ timeout: 15000 });

    // Optional: Verify a success message on your site
    // await expect(page.locator(selectors.subscriptionSuccessMessage)).toBeVisible();

    // Optional: Log out and log back in to verify subscription state persists
    await expect(page.locator(selectors.logoutButton)).toBeVisible({ timeout: 10000 });
    await page.locator(selectors.logoutButton).click();
  });
}); 