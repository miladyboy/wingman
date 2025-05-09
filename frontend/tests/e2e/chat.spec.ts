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
  try {
    await page.getByTestId('chat-item').first().waitFor({ state: 'visible', timeout: 5000 });
  } catch (e) {
    return; // No chats to delete
  }

  let safetyNet = 30;
  while (await page.getByTestId('chat-item').count() > 0 && safetyNet > 0) {
    safetyNet--;
    const chatItems = page.getByTestId('chat-item');
    const firstChat = chatItems.first();
    await expect(firstChat).toBeVisible({ timeout: 3000 });
    const deleteBtn = firstChat.getByTestId('delete-chat');
    await firstChat.hover();
    await expect(deleteBtn).toBeVisible({ timeout: 2000 });
    const confirmPromise = page.waitForEvent('dialog').then(dialog => dialog.accept());
    const prevCount = await chatItems.count();
    await Promise.all([
      deleteBtn.click(),
      confirmPromise,
      page.waitForFunction(
        ({ selector, prev }) => {
          const currentElements = document.querySelectorAll(selector);
          return currentElements.length < prev;
        },
        { selector: '[data-testid="chat-item"]', prev: prevCount },
        { timeout: 7000, polling: 500 }
      ).catch(err => {
        // Minimal error logging in case of failure, or re-throw
        console.error('Error waiting for chat item count to decrease:', err.message);
        throw err;
      })
    ]);
  }
  if (safetyNet === 0) {
    console.warn('[deleteAllChats] Safety net triggered. Final count:', await page.getByTestId('chat-item').count());
  }
  await expect(page.getByTestId('chat-item')).toHaveCount(0);
}

test.use({ storageState: 'playwright/.auth/subscribedUser.json' });

test.describe('Core Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    await deleteAllChats(page);
  });

  // test('user can start a new chat, send a message, and see it appear', async ({ page }) => {
  //   const chatName = await createNewChat(page, 1);
  //   await expect(page.getByTestId('chat-message-content').filter({ hasText: 'Hello from chat 1' })).toBeVisible();
  //   await expect(page.getByTestId('chat-item-name').filter({ hasText: chatName })).toBeVisible();
  // });

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

  test('user can upload an image in chat and see the preview', async ({ page }) => {
    const dummyImage = {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('dummy image content for test purposes'),
    };

    // 1. Locate the VISIBLE button that triggers the file input
    const attachImageButton = page.getByRole('button', { name: /attach image\(s\)/i });
    await expect(attachImageButton).toBeVisible({ timeout: 5000 });
    await expect(attachImageButton).toBeEnabled({ timeout: 5000 });

    // 2. Get a locator for the hidden file input (no visibility check needed here)
    const fileInput = page.getByTestId('chat-file-input');
    
    // 3. Set files on the hidden input
    // This is a common Playwright pattern for file uploads with custom triggers
    await fileInput.setInputFiles(dummyImage);

    // 4. Assert the preview appears
    const imagePreview = page.getByTestId('chat-image-preview');
    await expect(imagePreview).toBeVisible({ timeout: 10000 });
  });

});

// /**
//  * Active chat management tests
//  */
test.describe('Active chat management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app'); // Ensure starting on the app page
    await deleteAllChats(page); // Clear chats before each test
  });

  test('keeps last chat active after refresh', async ({ page }) => {
    const chat1 = await createNewChat(page, 1);
    const chat2 = await createNewChat(page, 2);

    await page.getByTestId('chat-item-name').filter({ hasText: chat1 }).click();
    await page.waitForTimeout(250);
    await expect(
      page.locator('[data-testid="chat-item"][data-active="true"] [data-testid="chat-item-name"]').filter({ hasText: chat1 })
    ).toBeVisible();

    await page.reload();

    await expect(page.getByTestId('chat-item').first()).toBeVisible();
    const activeChat = page.locator('[data-testid="chat-item"][data-active="true"]');
    await expect(activeChat).toHaveCount(1);
    const activeChatText = await activeChat.locator('[data-testid="chat-item-name"]').textContent();
    expect(activeChatText).toContain(chat1);
  });

  test('shows first chat as active on initial load (after setup)', async ({ page }) => {
    const chat1 = await createNewChat(page, 1);
    await expect(page.getByTestId('chat-item').first()).toBeVisible();
    const activeChat = page.locator('[data-testid="chat-item"][data-active="true"]');
    await expect(activeChat).toHaveCount(1);
    const activeChatText = await activeChat.textContent();
    expect(activeChatText).toContain(chat1);
  });

  test('shows new chat component if no chats exist', async ({ page }) => {
    await expect(page.getByTestId('chat-empty-state')).toBeVisible();
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

    await expect(page.getByTestId('chat-item-name').first()).toHaveText(chat2);

    // Switch to chat1, send a message, and wait for chat1 to move to the top
    await page.getByTestId('chat-item-name').filter({ hasText: chat1 }).click();
    await page.getByTestId('chat-input').fill('Hello again from chat 1');
    await page.getByTestId('send-message-button').click();
    await expect(page.getByTestId('chat-message-content').filter({ hasText: 'Hello again from chat 1' })).toBeVisible();
    await expect(page.getByTestId('chat-item-name').first()).toHaveText(chat1);
  });
}); 