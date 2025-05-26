import { test, expect } from "./utils/fixtures";
import {
  registerAndConfirmUser,
  completeSubscription,
  loginUser,
} from "./utils/userFlows";

// Use a blank storageState so we don't reuse / mutate shared subscribed states
test.use({ storageState: { cookies: [], origins: [] } });

const routes = {
  home: "/",
  auth: "/auth",
  app: "/app",
  subscribe: "/subscribe",
};

test.describe("Subscription Cancellation Flow", () => {
  test("User can cancel subscription and immediately loses access to pro features", async ({
    page,
  }) => {
    // 1. Register & confirm a new user (email verified but not yet subscribed)
    const { email, password } = await registerAndConfirmUser(page);

    // We should have been redirected to /subscribe after confirmation
    await expect(page).toHaveURL(routes.subscribe);

    // 2. Complete the subscription flow to become a paying user
    await completeSubscription(page);

    // Subscription should land the user on /app
    await expect(page).toHaveURL(routes.app);

    // 3. Open the account modal through the profile menu
    await page.getByTestId("profile-menu-button").click();
    await page.getByTestId("profile-menu-account").click();

    const accountModal = page.getByTestId("account-modal");
    await expect(accountModal).toBeVisible({ timeout: 10000 });

    // 4. Click the suspend/cancel membership button
    const suspendBtn = page.getByTestId("suspend-membership-button");
    await expect(suspendBtn).toBeEnabled();
    await suspendBtn.click();

    // After cancellation the backend signals logout; frontend redirects to landing
    await page.waitForURL(routes.home, { timeout: 60000 });
    await expect(page).toHaveURL(routes.home);

    // 5. Try to access a pro-only route; should be blocked / redirected
    await page.goto(routes.app);

    await page.waitForURL(/\/auth|\/subscribe/, { timeout: 60000 });
    expect(page.url()).not.toContain(routes.app);

    // Extra: Ensure the user actually cannot login to /app anymore using old credentials
    await loginUser(page, email, password);
    // After login, since subscription is cancelled, expect redirect to /subscribe
    await expect(page).toHaveURL(routes.subscribe);
  });
});
