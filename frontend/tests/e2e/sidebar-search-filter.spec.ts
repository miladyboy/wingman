import { test, expect } from "./utils/fixtures";
import {
  deleteAllChats,
  createNewChat,
  renameChat,
  getVisibleThreadTitles,
} from "./utils/chatHelpers";
import path from "path";
import { fileURLToPath } from "url";

const THREAD_TITLES = [
  "Anastasia",
  "Beautiful Ana",
  "Sarah",
  "Emma Watson",
  "Chat with Lisa",
];

test.describe("Sidebar Search / Filter", () => {
  test.beforeEach(async ({ subscribedUserPage: page }) => {
    await page.goto("/app");
    await deleteAllChats(page);

    // Create threads for this test
    const threadIds: string[] = [];
    for (let i = 0; i < THREAD_TITLES.length; i++) {
      const { threadId } = await createNewChat(page, i + 1);
      threadIds.push(threadId);
    }

    // Wait for all bot messages to appear (allowing for async bot responses)
    await page.waitForTimeout(5000);

    // Rename all threads in order
    for (let i = 0; i < THREAD_TITLES.length; i++) {
      await renameChat(page, threadIds[i], THREAD_TITLES[i]);
    }

    // Ensure all chats present
    await expect(page.getByTestId("chat-item")).toHaveCount(
      THREAD_TITLES.length
    );

    // Ensure search input starts empty for every test
    await page.getByTestId("chat-search-input").fill("");
  });

  test("filters by partial match and is case-insensitive", async ({
    subscribedUserPage: page,
  }) => {
    const searchInput = page.getByTestId("chat-search-input");

    // Type partial string "Ana" step by step to validate real-time filtering
    await searchInput.fill("A");
    // All titles have at least one 'a' / 'A', so count should remain the same
    await expect(page.getByTestId("chat-item")).toHaveCount(
      THREAD_TITLES.length
    );

    await searchInput.fill("An"); // "An"
    // With "An" only two chats should match (Anastasia & Beautiful Ana)
    await expect(page.getByTestId("chat-item")).toHaveCount(2);

    await searchInput.fill("Ana"); // "Ana"
    const expected = ["Anastasia", "Beautiful Ana"];
    await expect(page.getByTestId("chat-item")).toHaveCount(expected.length);
    const visibleAfterPartial = await getVisibleThreadTitles(page);
    expect(visibleAfterPartial.sort()).toEqual(expected.sort());

    // Case-insensitive check – clear then use lowercase
    await searchInput.fill("");
    await searchInput.fill("ana");
    await expect(page.getByTestId("chat-item")).toHaveCount(expected.length);

    // Uppercase
    await searchInput.fill("");
    await searchInput.fill("ANA");
    await expect(page.getByTestId("chat-item")).toHaveCount(expected.length);
  });

  test("clearing search restores full thread list", async ({
    subscribedUserPage: page,
  }) => {
    const searchInput = page.getByTestId("chat-search-input");
    await searchInput.fill("Watson");
    await expect(page.getByTestId("chat-item")).toHaveCount(1);

    // Clear via backspace (fill with empty string is simplest / most reliable)
    await searchInput.fill("");

    await expect(page.getByTestId("chat-item")).toHaveCount(
      THREAD_TITLES.length
    );
    const titles = await getVisibleThreadTitles(page);
    expect(titles.sort()).toEqual(THREAD_TITLES.sort());
  });

  test("shows empty state for zero matches and recovers afterwards", async ({
    subscribedUserPage: page,
  }) => {
    const searchInput = page.getByTestId("chat-search-input");
    const impossibleQuery = "xyz123$%";
    await searchInput.fill(impossibleQuery);

    // Expect empty state message and zero chat items
    await expect(page.locator("text=No chats found.")).toBeVisible();
    await expect(page.getByTestId("chat-item")).toHaveCount(0);

    // Recover – delete query and ensure chats repopulate
    await searchInput.fill("");
    await expect(page.getByTestId("chat-item")).toHaveCount(
      THREAD_TITLES.length
    );
  });
});
