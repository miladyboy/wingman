import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Cookie Consent", () => {
  test("shows banner on first visit, can accept, persists choice and handles refusal", async ({
    page,
  }) => {
    // Navigate to home page with a fresh context (localStorage & cookies are empty)
    await page.goto("/");

    const banner = page.getByTestId("cookie-consent-banner");

    // 1. Banner should be visible on first visit
    await expect(banner).toBeVisible();

    // Banner must have correct accessibility role
    await expect(banner).toHaveAttribute("role", "dialog");

    // 2. Accept the consent and verify it disappears
    await page.getByTestId("cookie-accept").click();
    await expect(banner).not.toBeVisible();

    // localStorage value should be set to "accepted"
    await expect(
      page.evaluate(() => localStorage.getItem("cookie_consent"))
    ).resolves.toBe("accepted");

    // Reload the page – banner should stay hidden due to persisted choice
    await page.reload();
    await expect(page.getByTestId("cookie-consent-banner")).not.toBeVisible();

    // 3. Simulate a new session by clearing storage, reload, and refuse cookies
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const bannerAfterClear = page.getByTestId("cookie-consent-banner");
    await expect(bannerAfterClear).toBeVisible();

    // Refuse consent
    await page.getByTestId("cookie-refuse").click();
    await expect(bannerAfterClear).not.toBeVisible();

    // localStorage value should be set to "refused"
    await expect(
      page.evaluate(() => localStorage.getItem("cookie_consent"))
    ).resolves.toBe("refused");

    // Reload again – banner should not reappear since refusal is persisted
    await page.reload();
    await expect(page.getByTestId("cookie-consent-banner")).not.toBeVisible();
  });
});
