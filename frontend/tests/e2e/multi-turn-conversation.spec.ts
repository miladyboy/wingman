import { test, expect } from "./utils/fixtures";
import { deleteAllChats, startNewChat, sendMessage } from "./utils/chatHelpers";

/**
 * E2E Test: Multi-Turn Conversation Flow
 * --------------------------------------
 * This test validates that a user can carry out a multi-step conversation
 * with the AI. It sequentially sends several contextually-related messages,
 * waits for the AI to reply to each one, and then verifies that the
 * conversation history maintains the correct order and message counts.
 */

test.describe("Multi-Turn Conversation Flow", () => {
  test.beforeEach(async ({ subscribedUserPage: page }) => {
    // Ensure we start from a clean slate
    await page.goto("/app");
    await deleteAllChats(page);
  });

  test("AI responds correctly throughout a multi-message exchange", async ({
    subscribedUserPage: page,
  }) => {
    // Start a completely new chat thread
    await startNewChat(page);

    // Messages that build on each other contextually
    const userMessages = [
      "Hi there! Could you give me some general travel tips?",
      "Thanks! Any recommendations for budget-friendly European destinations?",
      "Great choices. What are some must-pack essentials?",
      "Awesome. How should I plan my daily itinerary?",
    ];

    for (let i = 0; i < userMessages.length; i++) {
      const message = userMessages[i];

      // Track current counts BEFORE sending the next message so we can
      // assert they increment as expected later.
      const prevUserCount = await page
        .locator('[data-testid="chat-message"][data-sender="user"]')
        .count();
      const prevBotCount = await page
        .locator('[data-testid="chat-message"][data-sender="bot"]')
        .count();

      await sendMessage(page, message);

      // After the user message we expect user count +1
      await expect(
        page.locator('[data-testid="chat-message"][data-sender="user"]')
      ).toHaveCount(prevUserCount + 1);

      // Now wait for the corresponding AI reply
      await expect(
        page.locator('[data-testid="chat-message"][data-sender="bot"]')
      ).toHaveCount(prevBotCount + 1, { timeout: 60000 });

      /*
       * Validate ordering for the most recent exchange: the second-to-last
       * message should be the just-sent user message and the last message
       * should be the AI response.
       */
      const allMessages = page.getByTestId("chat-message");
      const totalMessages = await allMessages.count();
      // Last two messages
      const userMsgLocator = allMessages.nth(totalMessages - 2);
      const botMsgLocator = allMessages.nth(totalMessages - 1);

      // Verify senders
      await expect(userMsgLocator).toHaveAttribute("data-sender", "user");
      await expect(botMsgLocator).toHaveAttribute("data-sender", "bot");

      // Verify the user message content matches what we sent
      await expect(
        userMsgLocator.getByTestId("chat-message-content")
      ).toContainText(message);

      // Verify the AI reply has some non-empty content
      const aiText = await botMsgLocator
        .getByTestId("chat-message-content")
        .textContent();
      expect(aiText).toBeTruthy();
      expect(aiText!.trim().length).toBeGreaterThan(0);

      // Quick sanity check: total messages should equal (i + 1) * 2 (user + bot)
      await expect(allMessages).toHaveCount((i + 1) * 2);
    }
  });
});
