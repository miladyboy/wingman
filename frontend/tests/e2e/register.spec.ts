import { test, expect } from '@playwright/test';
import { getConfirmationLink } from './utils/mailtrap';

// Adjust selectors and URLs as needed for your app

test('user can register and confirm email', async ({ page }) => {
  // Go to the registration page
  await page.goto('/register');

  // Fill out the registration form
  const email = `testuser+${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  await page.fill('[data-testid="register-email"]', email);
  await page.fill('[data-testid="register-password"]', password);
  await page.click('[data-testid="register-submit"]');

  // Wait for the confirmation email to arrive
  await page.waitForTimeout(4000); // Consider polling for robustness

  // Fetch the confirmation link from Mailtrap
  const confirmationLink = await getConfirmationLink();
  expect(confirmationLink).toBeTruthy();

  // Visit the confirmation link
  await page.goto(confirmationLink);

  // Assert the user is redirected to /app (adjust as needed)
  await expect(page).toHaveURL(/\/app/);
}); 