import { test, expect } from '@playwright/test';
import {
  registerAndConfirmUser,
  completeSubscription,
  logoutUser,
  loginUser,
  type UserCredentials,
} from './utils/userFlows';

/**
 * Helper: Creates a new chat via the UI and waits for it to appear in the sidebar.
 * Returns the chat name (e.g., 'New Chat 1', 'New Chat 2', ...)
 * Assumes user is logged in and on a page where "+ New Chat" is visible (e.g., /app)
 */
async function createNewChat(page, chatNumber: number) {
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
 * Helper: Deletes every chat visible in the sidebar and waits until none remain.
 * Assumes user is logged in and on a page where chat items are visible (e.g., /app)
 */
async function deleteAllChats(page) {
  // A small wait to ensure UI is stable before checking for chat items
  await page.waitForTimeout(500); 
  const found = await page.waitForSelector('[data-testid="chat-item"]', { timeout: 1000 }).catch(() => null);
  if (!found) return; // No chats to delete

  while (await page.locator('[data-testid="chat-item"]').count() > 0) {
    const chatItems = page.locator('[data-testid="chat-item"]');
    const firstChat = chatItems.first();
    const deleteBtn = firstChat.locator('[data-testid="delete-chat"]');

    await firstChat.hover();

    // Accept the confirm dialog
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

  await expect(page.locator('[data-testid="chat-item"]')).toHaveCount(0);
}

test.describe('Authenticated User Chat Tests', () => {
  let user: UserCredentials | null = null;

  test.beforeAll('Setup', async ({ page }) => {
    const testEmail = process.env.PLAYWRIGHT_TEST_EMAIL;
    const testPassword = process.env.PLAYWRIGHT_TEST_PASSWORD;

    if (testEmail && testPassword) {
      console.log(`Attempting to log in with existing user: ${testEmail}`);
      await loginUser(page, testEmail, testPassword);
      // 'user' variable remains null or could be partially filled if needed,
      // but primary auth is via session cookie.
      console.log('Login successful with existing user.');
    } else {
      console.log('Registering and subscribing a new user...');
      user = await registerAndConfirmUser(page); // Register and confirm
      await completeSubscription(page); // Subscribe the new user
      console.log('New user registration and subscription successful.');
    }
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    // logoutUser navigates if necessary and handles logout
    await logoutUser(page); 
    await page.close();
  });

  test.describe('Core Chat Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/app');
      await deleteAllChats(page);
    });

    test('user can start a new chat, send a message, and see it appear', async ({ page }) => {
      const chatName = await createNewChat(page, 1); // Sends "Hello from chat 1"
      await expect(page.locator(`text=Hello from chat 1`)).toBeVisible();
      await expect(page.locator(`nav >> text=${chatName}`)).toBeVisible();
    });

    test('user can upload an image in chat and see the preview', async ({ page }) => {
      await createNewChat(page, 1); 

      const dummyImage = {
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('dummy image content for test purposes'), 
      };

      const fileInput = page.locator('[data-testid="chat-file-input"]');
      await expect(fileInput).toBeVisible({ timeout: 5000 });
      await fileInput.setInputFiles(dummyImage);

      const imagePreview = page.locator('[data-testid="image-preview"]');
      await expect(imagePreview).toBeVisible({ timeout: 10000 });
      // Example: verify a placeholder text or alt text if image itself is hard to verify
      // await expect(imagePreview.locator('img')).toHaveAttribute('alt', dummyImage.name);

      // Check for a message indicating image upload in chat history
      await expect(page.locator(`text=[Image: ${dummyImage.name}]`)).toBeVisible({ timeout: 10000 });
    });

    test('user can rename a conversation', async ({ page }) => {
      const originalChatName = await createNewChat(page, 1);
      const newChatName = 'My Awesome Renamed Chat';

      const chatItem = page.locator(`[data-testid="chat-item"]:has-text("${originalChatName}")`);
      await chatItem.hover();

      const renameButton = chatItem.locator('[data-testid="rename-chat-button"]');
      await renameButton.click();

      const renameInput = page.locator('[data-testid="rename-chat-input"]');
      await expect(renameInput).toBeVisible();
      await renameInput.fill(newChatName);
      await renameInput.press('Enter');

      await expect(page.locator(`[data-testid="chat-item"]:has-text("${originalChatName}")`)).not.toBeVisible();
      await expect(page.locator(`[data-testid="chat-item"]:has-text("${newChatName}")`)).toBeVisible();
    });

    test('user can delete a single conversation', async ({ page }) => {
      const chatToDeleteName = await createNewChat(page, 1);
      const chatToKeepName = await createNewChat(page, 2);

      const chatItemToDelete = page.locator(`[data-testid="chat-item"]:has-text("${chatToDeleteName}")`);
      await chatItemToDelete.hover();

      const deleteButton = chatItemToDelete.locator('[data-testid="delete-chat"]');
      
      // Re-registering page.on('dialog') inside the test or ensuring it's handled by a broader scope
      // if multiple tests trigger dialogs. For isolated tests, this is fine.
      page.once('dialog', dialog => dialog.accept()); 

      await deleteButton.click();

      await expect(page.locator(`[data-testid="chat-item"]:has-text("${chatToDeleteName}")`)).not.toBeVisible({ timeout: 5000 });
      await expect(page.locator(`[data-testid="chat-item"]:has-text("${chatToKeepName}")`)).toBeVisible();
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
      await page.click(`nav >> text=${chat2}`);
      await page.reload();
      const activeChat = await page.locator('nav [data-active="true"]').first();
      const activeChatText = await activeChat.textContent();
      expect(activeChatText).toContain(chat2);
    });

    test('shows first chat as active on initial load (after setup)', async ({ page }) => {
      const chat1 = await createNewChat(page, 1);
      // No reload needed here as beforeEach already sets up /app and clears chats.
      // We are verifying the state after creating one chat.
      const activeChat = await page.locator('nav [data-active="true"]').first();
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
      await page.click(`nav >> text=${chat2}`);
      await page.fill('textarea, input[name="newMessageText"]', 'Hello again from chat 2');
      await page.click('button:has-text("Send")');
      await page.waitForSelector('text=Hello again from chat 2');
      // No reload needed to check order, it should update dynamically.
      // If checking persistence, then reload. For this test, dynamic order is fine.
      // await page.reload(); // Uncomment if testing persistence after reload specifically
      // await page.waitForSelector('nav'); // Ensure nav is loaded after reload
      const firstChat = await page.locator('nav [role="listitem"]').first();
      const firstChatText = await firstChat.textContent();
      expect(firstChatText).toContain(chat2);
    });
  });
}); 