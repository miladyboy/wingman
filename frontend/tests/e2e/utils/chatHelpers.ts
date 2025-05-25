import { Page, expect } from "@playwright/test";

/**
 * Helper: Deletes every chat visible in the sidebar and waits until none remain.
 * Assumes user is logged in and on a page where chat items are visible (e.g., /app)
 */
export async function deleteAllChats(page: Page): Promise<void> {
  try {
    await page
      .getByTestId("chat-item")
      .first()
      .waitFor({ state: "visible", timeout: 5000 });
  } catch (e) {
    return; // No chats to delete
  }

  let safetyNet = 30;
  while ((await page.getByTestId("chat-item").count()) > 0 && safetyNet > 0) {
    safetyNet--;
    const chatItems = page.getByTestId("chat-item");
    const firstChat = chatItems.first();
    await expect(firstChat).toBeVisible({ timeout: 3000 });
    const deleteBtn = firstChat.getByTestId("delete-chat");
    await firstChat.hover();
    await expect(deleteBtn).toBeVisible({ timeout: 2000 });
    const prevCount = await chatItems.count();
    await deleteBtn.click();
    // Wait for modal and confirm
    const confirmBtn = page.getByTestId("confirm-delete-chat");
    await expect(confirmBtn).toBeVisible({ timeout: 2000 });
    await confirmBtn.click();
    await page
      .waitForFunction(
        ({ selector, prev }: { selector: string; prev: number }) => {
          const currentElements = document.querySelectorAll(selector);
          return currentElements.length < prev;
        },
        { selector: '[data-testid="chat-item"]', prev: prevCount },
        { timeout: 7000, polling: 500 }
      )
      .catch((err: Error) => {
        console.error(
          "Error waiting for chat item count to decrease:",
          err.message
        );
        throw err;
      });
  }
  if (safetyNet === 0) {
    console.warn(
      "[deleteAllChats] Safety net triggered. Final count:",
      await page.getByTestId("chat-item").count()
    );
  }
  await expect(page.getByTestId("chat-item")).toHaveCount(0);
}

/**
 * Helper: Sends a message and waits for it to appear in the chat
 */
export async function sendMessage(page: Page, message: string): Promise<void> {
  await page.getByTestId("chat-input").fill(message);
  await page.getByTestId("send-message-button").click();

  // Wait for the user message to appear
  await page
    .getByTestId("chat-message")
    .filter({
      has: page
        .getByTestId("chat-message-content")
        .filter({ hasText: message }),
    })
    .first()
    .waitFor({ timeout: 10000 });
}

/**
 * Helper: Simply starts a new chat by clicking the new chat button.
 * Assumes user is logged in and on a page where "+ New Chat" is visible (e.g., /app)
 */
export async function startNewChat(page: Page): Promise<void> {
  await page.getByTestId("new-chat-button").click();
}

/**
 * Helper: Creates a new chat via the UI and waits for it to appear in the sidebar.
 * Returns the chat title as it appears in the UI and the message sent.
 * Assumes user is logged in and on a page where "+ New Chat" is visible (e.g., /app)
 */
export async function createNewChat(
  page: Page,
  chatNumber: number
): Promise<{ chatTitle: string; message: string }> {
  await startNewChat(page);
  const message = `Hello from chat ${chatNumber}`;
  await page.getByTestId("chat-input").fill(message);
  await page.getByTestId("send-message-button").click();

  // Wait for the message to appear - use first() to avoid strict mode violation
  await page
    .getByTestId("chat-message-content")
    .filter({ hasText: message })
    .first()
    .waitFor();

  // Get the current chat title from the sidebar (first chat is always the new one)
  const chatTitleLocator = page.getByTestId("chat-item-name").first();
  await chatTitleLocator.waitFor();
  const chatTitle = await chatTitleLocator.textContent();
  return { chatTitle: chatTitle ?? "", message };
}
