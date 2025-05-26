import { test, expect } from "./utils/fixtures";
import { deleteAllChats, startNewChat, sendMessage } from "./utils/chatHelpers";

/**
 * E2E Test: Verify AI Reply Generation After User Message
 * -------------------------------------------------------
 * This test confirms that when a user sends a single message in a brand-new
 * chat thread, the application generates an AI reply (data-sender="bot") that
 * 1. Appears in the UI within a reasonable amount of time (≤ 60 s) and
 * 2. Contains non-empty textual content.
 *
 * We take inspiration from the multi-turn conversation spec to track message
 * counts before and after the interaction, ensuring that exactly one additional
 * user message and one additional bot message are added and that ordering is
 * preserved (user message immediately followed by the AI reply).
 */

test.describe("AI Response Generation", () => {
  test.beforeEach(async ({ subscribedUserPage: page }) => {
    // Navigate to the chat application and start with a clean slate.
    await page.goto("/app");
    await deleteAllChats(page);
  });

  test("AI generates a reply after user sends a message", async ({
    subscribedUserPage: page,
  }) => {
    // 1. Begin a new chat thread
    await startNewChat(page);

    // 2. Prepare and send a test message
    const userMessage = "Hello AI! What is the capital of France?";

    // Record message counts BEFORE sending anything so we can assert increments later
    const prevUserCount = await page
      .locator('[data-testid="chat-message"][data-sender="user"]')
      .count();
    const prevBotCount = await page
      .locator('[data-testid="chat-message"][data-sender="bot"]')
      .count();

    // Send the user message via the helper, which waits for it to render
    await sendMessage(page, userMessage);

    // After sending, there should be exactly one more user message
    await expect(
      page.locator('[data-testid="chat-message"][data-sender="user"]')
    ).toHaveCount(prevUserCount + 1);

    // Wait for the AI reply (with generous timeout for model latency)
    await expect(
      page.locator('[data-testid="chat-message"][data-sender="bot"]')
    ).toHaveCount(prevBotCount + 1, { timeout: 60000 });

    // Grab all messages to validate ordering (user then bot)
    const allMessages = page.getByTestId("chat-message");
    const totalMessages = await allMessages.count();

    // The last two messages in the thread should be the user message we sent and the AI response.
    const userMsgLocator = allMessages.nth(totalMessages - 2);
    const botMsgLocator = allMessages.nth(totalMessages - 1);

    // Verify senders
    await expect(userMsgLocator).toHaveAttribute("data-sender", "user");
    await expect(botMsgLocator).toHaveAttribute("data-sender", "bot");

    // Verify the user message content is what we sent
    await expect(
      userMsgLocator.getByTestId("chat-message-content")
    ).toContainText(userMessage);

    // Verify AI reply has non-empty content
    const aiText = await botMsgLocator
      .getByTestId("chat-message-content")
      .textContent();
    expect(aiText).toBeTruthy();
    expect(aiText!.trim().length).toBeGreaterThan(0);

    // Final sanity: total message count should be exactly 2 more than when we started
    await expect(allMessages).toHaveCount(prevUserCount + prevBotCount + 2);
  });
});
