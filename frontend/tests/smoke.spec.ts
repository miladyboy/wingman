import { test, expect } from '@playwright/test';

/**
 * Helper: Loads test user credentials from environment variables at runtime.
 */
function getTestUserCredentials() {
  return {
    email: process.env.PLAYWRIGHT_TEST_EMAIL,
    password: process.env.PLAYWRIGHT_TEST_PASSWORD,
  };
}

/**
 * Helper: Logs in as the test user via the UI.
 */
async function login(page) {
  const { email, password } = getTestUserCredentials();
  await page.goto('/auth');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app', { timeout: 10000 });
}

/**
 * Helper: Creates a new chat via the UI and waits for it to appear in the sidebar.
 * Returns the chat name (e.g., 'New Chat 1', 'New Chat 2', ...)
 */
async function createNewChat(page, chatNumber) {
  await page.click('button:has-text("+ New Chat")');
  const chatName = `New Chat ${chatNumber}`;
  // Type and send a message to actually create the chat
  const message = `Hello from chat ${chatNumber}`;
  await page.fill('textarea, input[name="newMessageText"]', message);
  await page.click('button:has-text("Send")');
  // Wait for the message to appear in chat history
  await page.waitForSelector(`text=${message}`);
  // Wait for the chat to appear in the sidebar
  await page.waitForSelector(`nav >> text=${chatName}`);
  return chatName;
}

/**
 * Helper: Deletes all chats for the test user via the UI.
 * Iterates through all chats in the sidebar, clicks the delete button, and accepts the confirmation dialog.
 */
async function deleteAllChats(page) {
  // Listen for and accept confirmation dialogs
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });
  // Find all chat items in the sidebar
  let chatItems = await page.$$('nav [role="listitem"]');
  while (chatItems.length > 0) {
    for (const chatItem of chatItems) {
      await chatItem.hover();
      const deleteBtn = await chatItem.$('[aria-label="Delete chat"]');
      if (deleteBtn) {
        await Promise.all([
          chatItem.waitForElementState('detached'),
          deleteBtn.click(),
        ]);
      }
    }
    // Refresh the list of chat items
    chatItems = await page.$$('nav [role="listitem"]');
  }
}

// /**
//  * Smoke test: Loads the homepage and checks for the main header loads.
//  */
// test('homepage loads and chat input is visible', async ({ page }) => {
//   await page.goto('/');
//   const headline = await page.locator('h1.font-headline');
//   await expect(headline).toBeVisible();
//   await expect(headline).toContainText('Your Personal AI Wingman');
// });

// /**
//  * Active chat management tests
//  */
test.describe('Active chat management', () => {
  test('keeps last chat active after refresh', async ({ page }) => {
    await login(page);
    await deleteAllChats(page);
    // Create two chats
    const chat1 = await createNewChat(page, 1);
    const chat2 = await createNewChat(page, 2);
    // Select the second chat
    await page.click(`nav >> text=${chat2}`);
    // Refresh
    await page.reload();
    // The second chat should still be active
    const activeChat = await page.locator('nav [data-active="true"]').first();
    const activeChatText = await activeChat.textContent();
    expect(activeChatText).toContain(chat2);
  });

  test('shows first chat as active on login', async ({ page }) => {
    await login(page);
    await deleteAllChats(page);
    // Create at least one chat
    const chat1 = await createNewChat(page, 1);
    // Reload to simulate fresh login
    await page.reload();
    // The first chat should be active
    const activeChat = await page.locator('nav [data-active="true"]').first();
    const activeChatText = await activeChat.textContent();
    expect(activeChatText).toContain(chat1);
  });

  test('shows new chat component if no chats exist', async ({ page }) => {
    await login(page);
    await deleteAllChats(page);
    // Should see the new chat prompt
    await expect(page.locator('text=Start your new conversation by sending a message.')).toBeVisible();
  });
});

test.describe('Chat ordering', () => {
  test('sending a message moves chat to top', async ({ page }) => {
    await login(page);
    await deleteAllChats(page);
    // Create two conversations
    const chat1 = await createNewChat(page, 1);
    const chat2 = await createNewChat(page, 2);
    // Select the second chat and send a message
    await page.click(`nav >> text=${chat2}`);
    await page.fill('textarea, input[name="newMessageText"]', 'Hello from chat 2');
    await page.click('button:has-text("Send")');
    // Wait for message to appear in chat history
    await page.waitForSelector('text=Hello from chat 2');
    // Reload and check chat order
    await page.reload();
    await page.waitForSelector('nav');
    const firstChat = await page.locator('nav [role="listitem"]').first();
    const firstChatText = await firstChat.textContent();
    expect(firstChatText).toContain(chat2);
  });
}); 