import { test, expect } from '@playwright/test';

/**
 * Helper: Creates a new chat via the UI and waits for it to appear in the sidebar.
 * Returns the chat name (e.g., 'New Chat 1', 'New Chat 2', ...)
 * Assumes user is logged in and on a page where "+ New Chat" is visible (e.g., /app)
 */
async function createNewChat(page, chatNumber: number) {
  await page.getByTestId('new-chat-button').click();
  const chatName = `New Chat ${chatNumber}`;
  const message = `Hello from chat ${chatNumber}`;
  await page.getByTestId('chat-input').fill(message);
  await page.getByTestId('send-message-button').click();
  await page.getByTestId('chat-message-content').filter({ hasText: message }).waitFor();
  await page.getByTestId('chat-item-name').filter({ hasText: chatName }).waitFor();
  return chatName;
}

/**
 * Helper: Deletes every chat visible in the sidebar and waits until none remain.
 * Assumes user is logged in and on a page where chat items are visible (e.g., /app)
 */
async function deleteAllChats(page) {
  await page.waitForTimeout(500);
  const found = await page.getByTestId('chat-item').first().waitFor({ timeout: 1000 }).catch(() => null);
  if (!found) return;

  while (await page.getByTestId('chat-item').count() > 0) {
    const chatItems = page.getByTestId('chat-item');
    const firstChat = chatItems.first();
    const deleteBtn = firstChat.getByTestId('delete-chat');

    await firstChat.hover();
    const confirmPromise = page.waitForEvent('dialog').then(d => d.accept());
    const prevCount = await chatItems.count();
    await Promise.all([
      deleteBtn.click(),
      confirmPromise,
      page.waitForFunction(
        ([sel, prev]) => document.querySelectorAll(sel).length < prev,
        ['[data-testid="chat-item"]', prevCount],
        { timeout: 5_000 }
      )
    ]);
  }
  await expect(page.getByTestId('chat-item')).toHaveCount(0);
}

test.use({ storageState: 'playwright/.auth/subscribedUser.json' });

test.describe('Core Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    await deleteAllChats(page);
  });

  test('user can start a new chat, send a message, and see it appear', async ({ page }) => {
    const chatName = await createNewChat(page, 1);
    await expect(page.getByTestId('chat-message-content').filter({ hasText: 'Hello from chat 1' })).toBeVisible();
    await expect(page.getByTestId('chat-item-name').filter({ hasText: chatName })).toBeVisible();
  });

  test('user can upload an image in chat and see the preview', async ({ page }) => {
    await createNewChat(page, 1);
    const dummyImage = {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('dummy image content for test purposes'),
    };
    const fileInput = page.getByTestId('chat-file-input');
    await expect(fileInput).toBeVisible({ timeout: 5000 });
    await fileInput.setInputFiles(dummyImage);
    const imagePreview = page.getByTestId('chat-message-image');
    await expect(imagePreview).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chat-message-content').filter({ hasText: `[Image: ${dummyImage.name}]` })).toBeVisible({ timeout: 10000 });
  });

  test('user can rename a conversation', async ({ page }) => {
    const originalChatName = await createNewChat(page, 1);
    const newChatName = 'My Awesome Renamed Chat';
    const chatItem = page.getByTestId('chat-item').filter({ has: page.getByTestId('chat-item-name').filter({ hasText: originalChatName }) });
    await chatItem.hover();
    const renameButton = chatItem.getByTestId('rename-chat-button');
    await renameButton.click();
    const renameInput = page.getByTestId('rename-chat-input');
    await expect(renameInput).toBeVisible();
    await renameInput.fill(newChatName);
    await renameInput.press('Enter');
    await expect(page.getByTestId('chat-item-name').filter({ hasText: originalChatName })).not.toBeVisible();
    await expect(page.getByTestId('chat-item-name').filter({ hasText: newChatName })).toBeVisible();
  });

  test('user can delete a single conversation', async ({ page }) => {
    const chatToDeleteName = await createNewChat(page, 1);
    const chatToKeepName = await createNewChat(page, 2);
    const chatItemToDelete = page.getByTestId('chat-item').filter({ has: page.getByTestId('chat-item-name').filter({ hasText: chatToDeleteName }) });
    await chatItemToDelete.hover();
    const deleteButton = chatItemToDelete.getByTestId('delete-chat');
    page.once('dialog', dialog => dialog.accept());
    await deleteButton.click();
    await expect(page.getByTestId('chat-item-name').filter({ hasText: chatToDeleteName })).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('chat-item-name').filter({ hasText: chatToKeepName })).toBeVisible();
  });
});

/**
 * Active chat management tests
 */
test.describe('Active chat management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app'); // Ensure starting on the app page
    await deleteAllChats(page); // Clear chats before each test
  });

  test('keeps last chat active after refresh', async ({ page }) => {
    const chat1 = await createNewChat(page, 1);
    const chat2 = await createNewChat(page, 2);
    await page.getByTestId('chat-item-name').filter({ hasText: chat2 }).click();
    await page.reload();
    // Ensure nav is loaded after reload, and then get the active chat
    await page.waitForSelector('nav [data-testid="chat-item"]'); 
    const activeChat = await page.locator('nav [data-testid="chat-item"][data-active="true"]').first();
    const activeChatText = await activeChat.textContent();
    expect(activeChatText).toContain(chat2);
  });

  test('shows first chat as active on initial load (after setup)', async ({ page }) => {
    const chat1 = await createNewChat(page, 1);
    await page.waitForSelector('nav [data-testid="chat-item"]'); 
    const activeChat = await page.locator('nav [data-testid="chat-item"][data-active="true"]').first();
    const activeChatText = await activeChat.textContent();
    expect(activeChatText).toContain(chat1);
  });

  test('shows new chat component if no chats exist', async ({ page }) => {
    // deleteAllChats in beforeEach ensures no chats exist
    await expect(page.locator('text=Start your new conversation by sending a message.')).toBeVisible();
  });
});

test.describe('Chat ordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    await deleteAllChats(page);
  });

  test('sending a message moves chat to top', async ({ page }) => {
    const chat1 = await createNewChat(page, 1);
    const chat2 = await createNewChat(page, 2);
    await page.getByTestId('chat-item-name').filter({ hasText: chat2 }).click();
    await page.fill('input[data-testid="chat-input"]', 'Hello again from chat 2');
    await page.getByTestId('send-message-button').click();
    await page.waitForSelector('div[data-testid="chat-message-content"]:has-text("Hello again from chat 2")');

    await page.waitForSelector('nav [data-testid="chat-item"]');
    const firstChat = await page.locator('nav [data-testid="chat-item"]').first();
    const firstChatText = await firstChat.textContent();
    expect(firstChatText).toContain(chat2);
  });
}); 