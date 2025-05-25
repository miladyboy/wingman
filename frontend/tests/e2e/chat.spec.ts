import { test, expect } from "@playwright/test";
import { deleteAllChats, createNewChat } from "./utils/chatHelpers";

test.use({ storageState: "playwright/.auth/subscribedUser.json" });

test.describe("Core Chat Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app");
    await deleteAllChats(page);
  });

  // test('user can start a new chat, send a message, and see it appear', async ({ page }) => {
  //   const chatName = await createNewChat(page, 1);
  //   await expect(page.getByTestId('chat-message-content').filter({ hasText: 'Hello from chat 1' })).toBeVisible();
  //   await expect(page.getByTestId('chat-item-name').filter({ hasText: chatName })).toBeVisible();
  // });

  test("user can rename a conversation", async ({ page }: { page: any }) => {
    const { chatTitle: originalChatTitle } = await createNewChat(page, 1);
    const newChatName = "My Awesome Renamed Chat";
    const chatItem = page.getByTestId("chat-item").filter({
      has: page
        .getByTestId("chat-item-name")
        .filter({ hasText: originalChatTitle }),
    });
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
    page,
  }: {
    page: any;
  }) => {
    const { chatTitle: chatToDeleteTitle } = await createNewChat(page, 1);
    const { chatTitle: chatToKeepTitle } = await createNewChat(page, 2);
    const chatItemToDelete = page.getByTestId("chat-item").filter({
      has: page
        .getByTestId("chat-item-name")
        .filter({ hasText: chatToDeleteTitle }),
    });
    await chatItemToDelete.hover();
    const deleteButton = chatItemToDelete.getByTestId("delete-chat");
    await deleteButton.click();
    // Espera y confirma en el modal
    const confirmBtn = page.getByTestId("confirm-delete-chat");
    await expect(confirmBtn).toBeVisible({ timeout: 2000 });
    await confirmBtn.click();
    await expect(
      page.getByTestId("chat-item-name").filter({ hasText: chatToDeleteTitle })
    ).not.toBeVisible({ timeout: 5000 });
    await expect(
      page.getByTestId("chat-item-name").filter({ hasText: chatToKeepTitle })
    ).toBeVisible();
  });

  test("user can upload an image in chat and see the preview", async ({
    page,
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
  test.beforeEach(async ({ page }: { page: any }) => {
    await page.goto("/app"); // Ensure starting on the app page
    await deleteAllChats(page); // Clear chats before each test
  });

  test("keeps last chat active after refresh", async ({
    page,
  }: {
    page: any;
  }) => {
    const { chatTitle: chat1Title } = await createNewChat(page, 1);
    const { chatTitle: chat2Title } = await createNewChat(page, 2);

    await page
      .getByTestId("chat-item-name")
      .filter({ hasText: chat1Title })
      .click();
    await page.waitForTimeout(250);
    await expect(
      page
        .locator(
          '[data-testid="chat-item"][data-active="true"] [data-testid="chat-item-name"]'
        )
        .filter({ hasText: chat1Title })
    ).toBeVisible();

    await page.reload();

    await expect(page.getByTestId("chat-item").first()).toBeVisible();
    const activeChat = page.locator(
      '[data-testid="chat-item"][data-active="true"]'
    );
    await expect(activeChat).toHaveCount(1);
    const activeChatText = await activeChat
      .locator('[data-testid="chat-item-name"]')
      .textContent();
    expect(activeChatText ?? "").toContain(chat1Title);
  });

  test("shows first chat as active on initial load (after setup)", async ({
    page,
  }: {
    page: any;
  }) => {
    const { chatTitle: chat1Title } = await createNewChat(page, 1);
    await expect(page.getByTestId("chat-item").first()).toBeVisible();
    const activeChat = page.locator(
      '[data-testid="chat-item"][data-active="true"]'
    );
    await expect(activeChat).toHaveCount(1);
    const activeChatText = await activeChat.textContent();
    expect(activeChatText ?? "").toContain(chat1Title);
  });

  test("shows new chat component if no chats exist", async ({ page }) => {
    await expect(page.getByTestId("chat-empty-state")).toBeVisible();
  });
});

test.describe("Chat ordering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app");
    await deleteAllChats(page);
  });

  test("sending a message moves chat to top", async ({ page }) => {
    const { chatTitle: chat1Title } = await createNewChat(page, 1);
    const { chatTitle: chat2Title } = await createNewChat(page, 2);

    await expect(page.getByTestId("chat-item-name").first()).toHaveText(
      chat2Title
    );

    // Switch to chat1, send a message, and wait for chat1 to move to the top
    await page
      .getByTestId("chat-item-name")
      .filter({ hasText: chat1Title })
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

    // Now check that chat1 has moved to the top
    await expect(page.getByTestId("chat-item-name").first()).toHaveText(
      chat1Title,
      { timeout: 15000 }
    );
  });
});
