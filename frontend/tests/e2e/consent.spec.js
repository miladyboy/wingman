import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Cookie Consent", () => {
  test("shows banner, respects accept/refuse, and persists choice", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByTestId("cookie-consent-banner")).toBeVisible();
    // Analytics should not be initialized
    await expect(page.evaluate(() => window.posthog)).resolves.toBeUndefined();
    await page.getByTestId("cookie-accept").click();
    await expect(page.getByTestId("cookie-consent-banner")).not.toBeVisible();
    // Analytics should be initialized
    await page.waitForFunction(() => window.posthog !== undefined);
    // Reload and banner should not reappear
    await page.reload();
    await expect(page.getByTestId("cookie-consent-banner")).not.toBeVisible();
    // Refuse cookies (simulate by clearing and refusing)
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId("cookie-refuse").click();
    await expect(page.getByTestId("cookie-consent-banner")).not.toBeVisible();
    // Analytics should not be initialized
    await expect(page.evaluate(() => window.posthog)).resolves.toBeUndefined();
  });
});
