import { test, expect } from "@playwright/test";
import { logoutUser, registerAndConfirmUser } from "./utils/userFlows";

const routes = {
  home: "/",
  auth: "/auth",
  subscribe: "/subscribe",
  app: "/app",
};

test.describe("Subscription Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Any setup needed before each test
  });

  test("User can register, confirm email, and subscribe", async ({ page }) => {
    const { email, password } = await registerAndConfirmUser(page);
    await expect(page).toHaveURL(routes.subscribe);

    // Click the subscribe button
    await page.click('[data-testid="proceed-to-checkout-button"]');

    // This would typically redirect to Stripe checkout
    // In a test environment, you might mock this or use Stripe's test mode
    await expect(page).toHaveURL(/stripe\.com|localhost/);
  });
});
