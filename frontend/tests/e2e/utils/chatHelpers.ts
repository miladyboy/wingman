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
 * Returns the chat title as it appears in the UI, the thread ID, and the message sent.
 * Assumes user is logged in and on a page where "+ New Chat" is visible (e.g., /app)
 */
export async function createNewChat(
  page: Page,
  chatNumber: number
): Promise<{ chatTitle: string; threadId: string; message: string }> {
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

  // Get the current chat title and thread ID from the sidebar (first chat is always the new one)
  const chatItemLocator = page.getByTestId("chat-item").first();
  await chatItemLocator.waitFor();

  const chatTitle = await chatItemLocator
    .getByTestId("chat-item-name")
    .textContent();
  const threadId = await chatItemLocator.getAttribute("data-thread-id");

  if (!threadId) {
    throw new Error("Could not get thread ID from chat item");
  }

  return { chatTitle: chatTitle ?? "", threadId, message };
}

/**
 * Helper: Renames an existing chat thread via the UI sidebar and waits until the new
 * title is visible. This mirrors how a real user performs the rename flow:
 * 1. Hover the chat item so the rename button appears.
 * 2. Click the rename button to reveal the input.
 * 3. Type the new name and confirm with Enter.
 * 4. Await the UI update ensuring the new name is rendered.
 *
 * @param page - Playwright Page object for browser automation
 * @param threadId - The thread identifier (data-thread-id attribute value)
 * @param newName - The new title to set for the chat thread
 * @returns Promise that resolves when the rename operation is complete
 */
export async function renameChat(
  page: Page,
  threadId: string,
  newName: string
): Promise<void> {
  const chatItem = page.locator(
    `[data-testid="chat-item"][data-thread-id="${threadId}"]`
  );

  // 1. Hover to reveal action buttons
  await chatItem.hover();

  // 2. Click the rename (pencil) button
  const renameButton = chatItem.getByTestId("rename-chat-button");
  await renameButton.click();

  // 3. Fill the input and confirm with Enter
  const renameInput = page.getByTestId("rename-chat-input");
  await expect(renameInput).toBeVisible();
  await renameInput.fill(newName);
  await renameInput.press("Enter");

  // 4. Verify that the chat title has been updated in the DOM
  await expect(chatItem.getByTestId("chat-item-name")).toHaveText(newName);
}

/**
 * Helper: Returns an array of chat titles currently visible in the sidebar.
 * Trims whitespace from each title to make assertions easier.
 *
 * @param page - Playwright Page object for browser automation
 * @returns Promise resolving to an array of visible sidebar thread titles
 */
export async function getVisibleThreadTitles(page: Page): Promise<string[]> {
  const titles = await page.getByTestId("chat-item-name").allTextContents();
  return titles.map((t) => t.trim());
}
