import { test, expect } from "./utils/fixtures";
import { logoutUser } from "./utils/userFlows";

const routes = {
  auth: "/auth",
  app: "/app",
  subscribe: "/subscribe",
  landing: "/",
};

test.describe("Route Guards", () => {
  test.describe("Authentication Guards (RequireAuth & RedirectIfAuth)", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("RequireAuth redirects unauthenticated users to /auth", async ({
      page,
    }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.auth);
    });

    test("RedirectIfAuth redirects authenticated users away from auth page", async ({
      page,
    }) => {
      await page.goto(routes.auth);
      await expect(page).toHaveURL(routes.auth);
    });
  });

  test.describe("Unsubscribed User (email verified, not subscribed)", () => {
    test("access to /app is redirected to /subscribe", async ({
      emailVerifiedUserPage: page,
    }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(
        page.getByTestId("proceed-to-checkout-button")
      ).toBeVisible();
      await logoutUser(page);
      await expect(page).toHaveURL(routes.landing);
    });

    test("from /landing is redirected to /subscribe", async ({
      emailVerifiedUserPage: page,
    }) => {
      await page.goto(routes.landing);
      await expect(page).toHaveURL(routes.subscribe, { timeout: 10000 });
      await expect(
        page.getByTestId("proceed-to-checkout-button")
      ).toBeVisible();
      await logoutUser(page);
    });

    test("from /auth is redirected to /subscribe", async ({
      emailVerifiedUserPage: page,
    }) => {
      await page.goto(routes.auth);
      await expect(page).toHaveURL(routes.subscribe, { timeout: 10000 });
      await expect(
        page.getByTestId("proceed-to-checkout-button")
      ).toBeVisible();
      await logoutUser(page);
    });

    test("[RequireSubscription] to /app is redirected to /subscribe", async ({
      emailVerifiedUserPage: page,
    }) => {
      await page.goto(routes.app);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(
        page.getByTestId("proceed-to-checkout-button")
      ).toBeVisible();
      await logoutUser(page);
    });

    test("[RedirectIfSubscribed] can access /subscribe", async ({
      emailVerifiedUserPage: page,
    }) => {
      await page.goto(routes.subscribe);
      await expect(page).toHaveURL(routes.subscribe);
      await expect(
        page.getByTestId("proceed-to-checkout-button")
      ).toBeVisible();
      await logoutUser(page);
    });
  });

  test.describe("Subscribed User", () => {
    test("[RequireSubscription] can access /app", async ({
      subscribedUserPage: page,
    }) => {
      await page.goto(routes.app);
      await page.waitForURL(routes.app, { timeout: 60000 });
      await expect(page).toHaveURL(routes.app);
      await expect(page.getByTestId("new-chat-button")).toBeVisible({
        timeout: 10000,
      });
      await logoutUser(page);
    });

    test("[RedirectIfSubscribed] to /subscribe is redirected to /app", async ({
      subscribedUserPage: page,
    }) => {
      await page.goto(routes.subscribe);
      await page.waitForURL(routes.app, { timeout: 60000 });
      await expect(page).toHaveURL(routes.app);
      await expect(page.getByTestId("new-chat-button")).toBeVisible({
        timeout: 10000,
      });
      await logoutUser(page);
    });
  });
});
