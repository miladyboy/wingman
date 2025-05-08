# Test info

- Name: Authenticated User Chat Tests >> Core Chat Functionality >> user can start a new chat, send a message, and see it appear
- Location: /Users/maurovelazquez/Code/harem/frontend/tests/e2e/chat.spec.ts:100:5

# Error details

```
Error: "context" and "page" fixtures are not supported in "beforeAll" since they are created on a per-test basis.
If you would like to reuse a single page between tests, create context manually with browser.newContext(). See https://aka.ms/playwright/reuse-page for details.
If you would like to configure your page before each test, do that in beforeEach hook instead.
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import {
   3 |   registerAndConfirmUser,
   4 |   completeSubscription,
   5 |   logoutUser,
   6 |   loginUser,
   7 |   type UserCredentials,
   8 | } from './utils/userFlows';
   9 |
   10 | /**
   11 |  * Helper: Creates a new chat via the UI and waits for it to appear in the sidebar.
   12 |  * Returns the chat name (e.g., 'New Chat 1', 'New Chat 2', ...)
   13 |  * Assumes user is logged in and on a page where "+ New Chat" is visible (e.g., /app)
   14 |  */
   15 | async function createNewChat(page, chatNumber: number) {
   16 |   await page.click('button:has-text("+ New Chat")');
   17 |   const chatName = `New Chat ${chatNumber}`;
   18 |   // Type and send a message to actually create the chat
   19 |   const message = `Hello from chat ${chatNumber}`;
   20 |   await page.fill('textarea, input[name="newMessageText"]', message);
   21 |   await page.click('button:has-text("Send")');
   22 |   // Wait for the message to appear in chat history
   23 |   await page.waitForSelector(`text=${message}`);
   24 |   // Wait for the chat to appear in the sidebar
   25 |   await page.waitForSelector(`nav >> text=${chatName}`);
   26 |   return chatName;
   27 | }
   28 |
   29 | /**
   30 |  * Helper: Deletes every chat visible in the sidebar and waits until none remain.
   31 |  * Assumes user is logged in and on a page where chat items are visible (e.g., /app)
   32 |  */
   33 | async function deleteAllChats(page) {
   34 |   // A small wait to ensure UI is stable before checking for chat items
   35 |   await page.waitForTimeout(500); 
   36 |   const found = await page.waitForSelector('[data-testid="chat-item"]', { timeout: 1000 }).catch(() => null);
   37 |   if (!found) return; // No chats to delete
   38 |
   39 |   while (await page.locator('[data-testid="chat-item"]').count() > 0) {
   40 |     const chatItems = page.locator('[data-testid="chat-item"]');
   41 |     const firstChat = chatItems.first();
   42 |     const deleteBtn = firstChat.locator('[data-testid="delete-chat"]');
   43 |
   44 |     await firstChat.hover();
   45 |
   46 |     // Accept the confirm dialog
   47 |     const confirmPromise = page.waitForEvent('dialog').then(d => d.accept());
   48 |
   49 |     const prevCount = await chatItems.count();
   50 |
   51 |     await Promise.all([
   52 |       deleteBtn.click(),
   53 |       confirmPromise,
   54 |       page.waitForFunction(
   55 |         ([sel, prev]) => document.querySelectorAll(sel).length < prev,
   56 |         ['[data-testid="chat-item"]', prevCount],
   57 |         { timeout: 5_000 }
   58 |       )
   59 |     ]);
   60 |   }
   61 |
   62 |   await expect(page.locator('[data-testid="chat-item"]')).toHaveCount(0);
   63 | }
   64 |
   65 | test.describe('Authenticated User Chat Tests', () => {
   66 |   let user: UserCredentials | null = null;
   67 |
   68 |   test.beforeAll('Setup', async ({ page }) => {
   69 |     const testEmail = process.env.PLAYWRIGHT_TEST_EMAIL;
   70 |     const testPassword = process.env.PLAYWRIGHT_TEST_PASSWORD;
   71 |
   72 |     if (testEmail && testPassword) {
   73 |       console.log(`Attempting to log in with existing user: ${testEmail}`);
   74 |       await loginUser(page, testEmail, testPassword);
   75 |       // 'user' variable remains null or could be partially filled if needed,
   76 |       // but primary auth is via session cookie.
   77 |       console.log('Login successful with existing user.');
   78 |     } else {
   79 |       console.log('Registering and subscribing a new user...');
   80 |       user = await registerAndConfirmUser(page); // Register and confirm
   81 |       await completeSubscription(page); // Subscribe the new user
   82 |       console.log('New user registration and subscription successful.');
   83 |     }
   84 |     await page.close();
   85 |   });
   86 |
   87 |   test.afterAll(async ({ browser }) => {
   88 |     const page = await browser.newPage();
   89 |     // logoutUser navigates if necessary and handles logout
   90 |     await logoutUser(page); 
   91 |     await page.close();
   92 |   });
   93 |
   94 |   test.describe('Core Chat Functionality', () => {
   95 |     test.beforeEach(async ({ page }) => {
   96 |       await page.goto('/app');
   97 |       await deleteAllChats(page);
   98 |     });
   99 |
> 100 |     test('user can start a new chat, send a message, and see it appear', async ({ page }) => {
      |     ^ Error: "context" and "page" fixtures are not supported in "beforeAll" since they are created on a per-test basis.
  101 |       const chatName = await createNewChat(page, 1); // Sends "Hello from chat 1"
  102 |       await expect(page.locator(`text=Hello from chat 1`)).toBeVisible();
  103 |       await expect(page.locator(`nav >> text=${chatName}`)).toBeVisible();
  104 |     });
  105 |
  106 |     test('user can upload an image in chat and see the preview', async ({ page }) => {
  107 |       await createNewChat(page, 1); 
  108 |
  109 |       const dummyImage = {
  110 |         name: 'test-image.png',
  111 |         mimeType: 'image/png',
  112 |         buffer: Buffer.from('dummy image content for test purposes'), 
  113 |       };
  114 |
  115 |       const fileInput = page.locator('[data-testid="chat-file-input"]');
  116 |       await expect(fileInput).toBeVisible({ timeout: 5000 });
  117 |       await fileInput.setInputFiles(dummyImage);
  118 |
  119 |       const imagePreview = page.locator('[data-testid="image-preview"]');
  120 |       await expect(imagePreview).toBeVisible({ timeout: 10000 });
  121 |       // Example: verify a placeholder text or alt text if image itself is hard to verify
  122 |       // await expect(imagePreview.locator('img')).toHaveAttribute('alt', dummyImage.name);
  123 |
  124 |       // Check for a message indicating image upload in chat history
  125 |       await expect(page.locator(`text=[Image: ${dummyImage.name}]`)).toBeVisible({ timeout: 10000 });
  126 |     });
  127 |
  128 |     test('user can rename a conversation', async ({ page }) => {
  129 |       const originalChatName = await createNewChat(page, 1);
  130 |       const newChatName = 'My Awesome Renamed Chat';
  131 |
  132 |       const chatItem = page.locator(`[data-testid="chat-item"]:has-text("${originalChatName}")`);
  133 |       await chatItem.hover();
  134 |
  135 |       const renameButton = chatItem.locator('[data-testid="rename-chat-button"]');
  136 |       await renameButton.click();
  137 |
  138 |       const renameInput = page.locator('[data-testid="rename-chat-input"]');
  139 |       await expect(renameInput).toBeVisible();
  140 |       await renameInput.fill(newChatName);
  141 |       await renameInput.press('Enter');
  142 |
  143 |       await expect(page.locator(`[data-testid="chat-item"]:has-text("${originalChatName}")`)).not.toBeVisible();
  144 |       await expect(page.locator(`[data-testid="chat-item"]:has-text("${newChatName}")`)).toBeVisible();
  145 |     });
  146 |
  147 |     test('user can delete a single conversation', async ({ page }) => {
  148 |       const chatToDeleteName = await createNewChat(page, 1);
  149 |       const chatToKeepName = await createNewChat(page, 2);
  150 |
  151 |       const chatItemToDelete = page.locator(`[data-testid="chat-item"]:has-text("${chatToDeleteName}")`);
  152 |       await chatItemToDelete.hover();
  153 |
  154 |       const deleteButton = chatItemToDelete.locator('[data-testid="delete-chat"]');
  155 |       
  156 |       // Re-registering page.on('dialog') inside the test or ensuring it's handled by a broader scope
  157 |       // if multiple tests trigger dialogs. For isolated tests, this is fine.
  158 |       page.once('dialog', dialog => dialog.accept()); 
  159 |
  160 |       await deleteButton.click();
  161 |
  162 |       await expect(page.locator(`[data-testid="chat-item"]:has-text("${chatToDeleteName}")`)).not.toBeVisible({ timeout: 5000 });
  163 |       await expect(page.locator(`[data-testid="chat-item"]:has-text("${chatToKeepName}")`)).toBeVisible();
  164 |     });
  165 |   });
  166 |
  167 |   /**
  168 |    * Active chat management tests
  169 |    */
  170 |   test.describe('Active chat management', () => {
  171 |     test.beforeEach(async ({ page }) => {
  172 |       await page.goto('/app'); // Ensure starting on the app page
  173 |       await deleteAllChats(page); // Clear chats before each test
  174 |     });
  175 |
  176 |     test('keeps last chat active after refresh', async ({ page }) => {
  177 |       const chat1 = await createNewChat(page, 1);
  178 |       const chat2 = await createNewChat(page, 2);
  179 |       await page.click(`nav >> text=${chat2}`);
  180 |       await page.reload();
  181 |       const activeChat = await page.locator('nav [data-active="true"]').first();
  182 |       const activeChatText = await activeChat.textContent();
  183 |       expect(activeChatText).toContain(chat2);
  184 |     });
  185 |
  186 |     test('shows first chat as active on initial load (after setup)', async ({ page }) => {
  187 |       const chat1 = await createNewChat(page, 1);
  188 |       // No reload needed here as beforeEach already sets up /app and clears chats.
  189 |       // We are verifying the state after creating one chat.
  190 |       const activeChat = await page.locator('nav [data-active="true"]').first();
  191 |       const activeChatText = await activeChat.textContent();
  192 |       expect(activeChatText).toContain(chat1);
  193 |     });
  194 |
  195 |     test('shows new chat component if no chats exist', async ({ page }) => {
  196 |       // deleteAllChats in beforeEach ensures no chats exist
  197 |       await expect(page.locator('text=Start your new conversation by sending a message.')).toBeVisible();
  198 |     });
  199 |   });
  200 |
```