import { test, expect } from "@playwright/test";
import { deleteAllChats, sendMessage, startNewChat } from "./utils/chatHelpers";

test.use({ storageState: "playwright/.auth/subscribedUser.json" });

test.describe("AI Response Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app");
    await deleteAllChats(page);
  });

  test("AI generates a reply after user sends a message", async ({ page }) => {
    // Start a new chat
    await startNewChat(page);

    // Send a simple test message that should generate a reliable AI response
    const testMessage = "Hello, can you help me with dating advice?";
    await sendMessage(page, testMessage);

    // Verify the user message appears with correct sender attribute
    const userMessage = page
      .getByTestId("chat-message")
      .filter({
        has: page
          .getByTestId("chat-message-content")
          .filter({ hasText: testMessage }),
      })
      .first();

    await expect(userMessage).toBeVisible();
    await expect(userMessage).toHaveAttribute("data-sender", "user");

    // Wait for AI reply to appear (with generous timeout for AI processing)
    // The AI reply should have data-sender="bot" and contain some content
    const aiMessage = page
      .locator('[data-testid="chat-message"][data-sender="bot"]')
      .first();

    await expect(aiMessage).toBeVisible({ timeout: 60000 });

    // Verify the AI message has content
    const aiMessageContent = aiMessage.getByTestId("chat-message-content");
    await expect(aiMessageContent).toBeVisible();

    // Verify the AI response contains some text (not empty)
    const aiText = await aiMessageContent.textContent();
    expect(aiText).toBeTruthy();
    expect(aiText!.trim().length).toBeGreaterThan(0);

    // Verify we now have exactly 2 messages: 1 user + 1 AI
    await expect(page.getByTestId("chat-message")).toHaveCount(2);
    await expect(
      page.locator('[data-testid="chat-message"][data-sender="user"]')
    ).toHaveCount(1);
    await expect(
      page.locator('[data-testid="chat-message"][data-sender="bot"]')
    ).toHaveCount(1);
  });

  test("AI reply appears after user message in correct order", async ({
    page,
  }) => {
    // Start a new chat
    await startNewChat(page);

    // Send a message
    const testMessage = "What's the best opening line for Tinder?";
    await sendMessage(page, testMessage);

    // Wait for AI reply
    await expect(
      page.locator('[data-testid="chat-message"][data-sender="bot"]')
    ).toBeVisible({ timeout: 60000 });

    // Get all messages in order
    const allMessages = page.getByTestId("chat-message");
    await expect(allMessages).toHaveCount(2);

    // Verify the first message is from user
    const firstMessage = allMessages.first();
    await expect(firstMessage).toHaveAttribute("data-sender", "user");

    // Verify the second message is from bot
    const secondMessage = allMessages.nth(1);
    await expect(secondMessage).toHaveAttribute("data-sender", "bot");

    // Verify the user message contains our test message
    await expect(
      firstMessage.getByTestId("chat-message-content")
    ).toContainText(testMessage);

    // Verify the AI message has some content
    const aiContent = await secondMessage
      .getByTestId("chat-message-content")
      .textContent();
    expect(aiContent).toBeTruthy();
    expect(aiContent!.trim().length).toBeGreaterThan(10); // Reasonable minimum length for AI response
  });

  test("AI responds to different types of messages", async ({ page }) => {
    // Start a new chat
    await startNewChat(page);

    // Test with a question
    const questionMessage =
      "How do I start a conversation with someone I like?";
    await sendMessage(page, questionMessage);

    // Wait for first AI reply
    await expect(
      page.locator('[data-testid="chat-message"][data-sender="bot"]')
    ).toBeVisible({ timeout: 60000 });

    // Send a follow-up message
    const followUpMessage =
      "That's helpful, can you give me a specific example?";
    await sendMessage(page, followUpMessage);

    // Wait for second AI reply
    await expect(
      page.locator('[data-testid="chat-message"][data-sender="bot"]')
    ).toHaveCount(2, { timeout: 60000 });

    // Verify we have the expected message count: 2 user + 2 AI = 4 total
    await expect(page.getByTestId("chat-message")).toHaveCount(4);
    await expect(
      page.locator('[data-testid="chat-message"][data-sender="user"]')
    ).toHaveCount(2);
    await expect(
      page.locator('[data-testid="chat-message"][data-sender="bot"]')
    ).toHaveCount(2);
  });
});
