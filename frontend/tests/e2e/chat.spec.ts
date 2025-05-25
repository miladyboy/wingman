import { test, expect } from "./utils/fixtures";
import { deleteAllChats, createNewChat } from "./utils/chatHelpers";

test.describe("Core Chat Functionality", () => {
  test.beforeEach(async ({ subscribedUserPage }) => {
    await subscribedUserPage.goto("/app");
    await deleteAllChats(subscribedUserPage);
  });

  // test('user can start a new chat, send a message, and see it appear', async ({ page }) => {
  //   const chatName = await createNewChat(page, 1);
  //   await expect(page.getByTestId('chat-message-content').filter({ hasText: 'Hello from chat 1' })).toBeVisible();
  //   await expect(page.getByTestId('chat-item-name').filter({ hasText: chatName })).toBeVisible();
  // });

  test("user can rename a conversation", async ({
    subscribedUserPage: page,
  }) => {
    const { chatTitle: originalChatTitle, threadId } = await createNewChat(
      page,
      1
    );
    const newChatName = "My Awesome Renamed Chat";
    const chatItem = page.locator(
      `[data-testid="chat-item"][data-thread-id="${threadId}"]`
    );
    await chatItem.hover();
    const renameButton = chatItem.getByTestId("rename-chat-button");
    await renameButton.click();
    const renameInput = page.getByTestId("rename-chat-input");
    await expect(renameInput).toBeVisible();
    await renameInput.fill(newChatName);
    await renameInput.press("Enter");
    await expect(
      page.getByTestId("chat-item-name").filter({ hasText: originalChatTitle })
    ).not.toBeVisible();
    await expect(
      page.getByTestId("chat-item-name").filter({ hasText: newChatName })
    ).toBeVisible();
  });

  test("user can delete a single conversation", async ({
    subscribedUserPage: page,
  }) => {
    const { chatTitle: chatToDeleteTitle, threadId: chatToDeleteThreadId } =
      await createNewChat(page, 1);
    const { chatTitle: chatToKeepTitle, threadId: chatToKeepThreadId } =
      await createNewChat(page, 2);
    const chatItemToDelete = page.locator(
      `[data-testid="chat-item"][data-thread-id="${chatToDeleteThreadId}"]`
    );
    await chatItemToDelete.hover();
    const deleteButton = chatItemToDelete.getByTestId("delete-chat");
    await deleteButton.click();
    // Espera y confirma en el modal
    const confirmBtn = page.getByTestId("confirm-delete-chat");
    await expect(confirmBtn).toBeVisible({ timeout: 2000 });
    await confirmBtn.click();
    await expect(
      page.locator(
        `[data-testid="chat-item"][data-thread-id="${chatToDeleteThreadId}"]`
      )
    ).not.toBeVisible({ timeout: 5000 });
    await expect(
      page.locator(
        `[data-testid="chat-item"][data-thread-id="${chatToKeepThreadId}"]`
      )
    ).toBeVisible();
  });

  test("user can upload an image in chat and see the preview", async ({
    subscribedUserPage: page,
  }) => {
    const dummyImage = {
      name: "test-image.png",
      mimeType: "image/png",
      buffer: Buffer.from("dummy image content for test purposes"),
    };

    // 1. Locate the VISIBLE button that triggers the file input
    const attachImageButton = page.getByRole("button", {
      name: /attach image\(s\)/i,
    });
    await expect(attachImageButton).toBeVisible({ timeout: 5000 });
    await expect(attachImageButton).toBeEnabled({ timeout: 5000 });

    // 2. Get a locator for the hidden file input (no visibility check needed here)
    const fileInput = page.getByTestId("chat-file-input");

    // 3. Set files on the hidden input
    // This is a common Playwright pattern for file uploads with custom triggers
    await fileInput.setInputFiles(dummyImage);

    // 4. Assert the preview appears
    const imagePreview = page.getByTestId("chat-image-preview");
    await expect(imagePreview).toBeVisible({ timeout: 10000 });
  });
});

// /**
//  * Active chat management tests
//  */
test.describe("Active chat management", () => {
  test.beforeEach(async ({ subscribedUserPage: page }) => {
    await page.goto("/app"); // Ensure starting on the app page
    await deleteAllChats(page); // Clear chats before each test
  });

  test("keeps last chat active after refresh", async ({
    subscribedUserPage: page,
  }) => {
    const { threadId: chat1ThreadId } = await createNewChat(page, 1);
    const { threadId: chat2ThreadId } = await createNewChat(page, 2);

    // Click on chat1 to make it active
    await page
      .locator(`[data-testid="chat-item"][data-thread-id="${chat1ThreadId}"]`)
      .click();
    await page.waitForTimeout(250);

    // Verify chat1 is active before refresh
    await expect(
      page.locator(
        `[data-testid="chat-item"][data-thread-id="${chat1ThreadId}"][data-active="true"]`
      )
    ).toBeVisible();

    await page.reload();

    // After refresh, verify that the same chat (by thread ID) is still active
    await expect(page.getByTestId("chat-item").first()).toBeVisible();
    const activeChat = page.locator(
      '[data-testid="chat-item"][data-active="true"]'
    );
    await expect(activeChat).toHaveCount(1);

    // Get the thread ID of the active chat and verify it matches chat1
    const activeChatThreadId = await activeChat.getAttribute("data-thread-id");
    expect(activeChatThreadId).toBe(chat1ThreadId);
  });

  test("shows first chat as active on initial load (after setup)", async ({
    subscribedUserPage: page,
  }) => {
    const { threadId: chat1ThreadId } = await createNewChat(page, 1);
    await expect(page.getByTestId("chat-item").first()).toBeVisible();
    const activeChat = page.locator(
      '[data-testid="chat-item"][data-active="true"]'
    );
    await expect(activeChat).toHaveCount(1);

    // Verify the active chat is the one we created by checking its thread ID
    const activeChatThreadId = await activeChat.getAttribute("data-thread-id");
    expect(activeChatThreadId).toBe(chat1ThreadId);
  });

  test("shows new chat component if no chats exist", async ({
    subscribedUserPage: page,
  }) => {
    await expect(page.getByTestId("chat-empty-state")).toBeVisible();
  });
});

test.describe("Chat ordering", () => {
  test.beforeEach(async ({ subscribedUserPage: page }) => {
    await page.goto("/app");
    await deleteAllChats(page);
  });

  test("sending a message moves chat to top", async ({
    subscribedUserPage: page,
  }) => {
    const { threadId: chat1ThreadId } = await createNewChat(page, 1);
    const { threadId: chat2ThreadId } = await createNewChat(page, 2);

    // Verify chat2 is at the top initially (most recent)
    const firstChatThreadId = await page
      .getByTestId("chat-item")
      .first()
      .getAttribute("data-thread-id");
    expect(firstChatThreadId).toBe(chat2ThreadId);

    // Switch to chat1, send a message, and wait for chat1 to move to the top
    await page
      .locator(`[data-testid="chat-item"][data-thread-id="${chat1ThreadId}"]`)
      .click();
    await page.getByTestId("chat-input").fill("Hello again from chat 1");
    await page.getByTestId("send-message-button").click();

    // Wait for the message to appear in the chat
    await expect(
      page
        .getByTestId("chat-message-content")
        .filter({ hasText: "Hello again from chat 1" })
        .first()
    ).toBeVisible();

    // Wait for the AI response to start (indicating backend processing is complete)
    await page.waitForTimeout(1000); // Give time for the optimistic update and backend processing

    // Now check that chat1 has moved to the top by verifying its thread ID
    const topChatThreadId = await page
      .getByTestId("chat-item")
      .first()
      .getAttribute("data-thread-id");
    expect(topChatThreadId).toBe(chat1ThreadId);
  });
});
