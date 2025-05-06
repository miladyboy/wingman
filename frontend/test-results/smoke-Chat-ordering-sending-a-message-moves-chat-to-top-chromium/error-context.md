# Test info

- Name: Chat ordering >> sending a message moves chat to top
- Location: /Users/maurovelazquez/Code/harem/frontend/tests/smoke.spec.ts:131:3

# Error details

```
Error: locator.textContent: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('nav [role="listitem"]').first()

    at /Users/maurovelazquez/Code/harem/frontend/tests/smoke.spec.ts:147:43
```

# Page snapshot

```yaml
- button "+ New Chat"
- navigation:
  - text: New Chat 2
  - button "Rename chat"
  - button "Delete chat":
    - img "Delete": 🗑️
  - text: New Chat 2
  - button "Rename chat"
  - button "Delete chat":
    - img "Delete": 🗑️
  - text: New Chat 1
  - button "Rename chat"
  - button "Delete chat":
    - img "Delete": 🗑️
  - text: New Chat 1
  - button "Rename chat"
  - button "Delete chat":
    - img "Delete": 🗑️
  - text: New Chat 1
  - button "Rename chat"
  - button "Delete chat":
    - img "Delete": 🗑️
- text: "Logged in as: lpdaemon"
- button "Logout"
- heading "New Chat 2" [level=2]
- text: Hello from chat 2 To craft engaging replies, could you provide more context or previous chat messages from your conversation? With more details, I'll be able to offer some clever and flirty options! Hello from chat 2
- button "Choose File"
- textbox "Enter text or upload an image..."
- text: Attach image(s)
- button "Attach image(s)"
- button "Send" [disabled]
```

# Test source

```ts
   47 |   await page.waitForTimeout(500);
   48 |   const found = await page.waitForSelector('[data-testid="chat-item"]', { timeout: 500 }).catch(() => null);
   49 |   if (!found)  return;
   50 |
   51 |   while (await page.locator('[data-testid="chat-item"]').count() > 0) {
   52 |     const chatItems  = page.locator('[data-testid="chat-item"]');
   53 |     const firstChat  = chatItems.first();
   54 |     const deleteBtn  = firstChat.locator('[data-testid="delete-chat"]');
   55 |
   56 |     await firstChat.hover();
   57 |
   58 |     // accept the confirm dialog
   59 |     const confirm = page.waitForEvent('dialog').then(d => d.accept());
   60 |
   61 |     const prevCount = await chatItems.count();
   62 |
   63 |     await Promise.all([
   64 |       deleteBtn.click(),
   65 |       confirm,
   66 |       page.waitForFunction(
   67 |         ([sel, prev]) => document.querySelectorAll(sel).length < prev,
   68 |         ['[data-testid="chat-item"]', prevCount],
   69 |         { timeout: 5_000 }
   70 |       )
   71 |     ]);
   72 |   }
   73 |
   74 |   await expect(page.locator('[data-testid="chat-item"]')).toHaveCount(0);
   75 | }
   76 |
   77 |
   78 |
   79 | /**
   80 |  * Smoke test: Loads the homepage and checks for the main header loads.
   81 |  */
   82 | test('homepage loads and chat input is visible', async ({ page }) => {
   83 |   await page.goto('/');
   84 |   const headline = await page.locator('h1.font-headline');
   85 |   await expect(headline).toBeVisible();
   86 |   await expect(headline).toContainText('Your Personal AI Wingman');
   87 | });
   88 |
   89 | // /**
   90 | //  * Active chat management tests
   91 | //  */
   92 | test.describe('Active chat management', () => {
   93 |   test('keeps last chat active after refresh', async ({ page }) => {
   94 |     await login(page);
   95 |     await deleteAllChats(page);
   96 |     // Create two chats
   97 |     const chat1 = await createNewChat(page, 1);
   98 |     const chat2 = await createNewChat(page, 2);
   99 |     // Select the second chat
  100 |     await page.click(`nav >> text=${chat2}`);
  101 |     // Refresh
  102 |     await page.reload();
  103 |     // The second chat should still be active
  104 |     const activeChat = await page.locator('nav [data-active="true"]').first();
  105 |     const activeChatText = await activeChat.textContent();
  106 |     expect(activeChatText).toContain(chat2);
  107 |   });
  108 |
  109 |   test('shows first chat as active on login', async ({ page }) => {
  110 |     await login(page);    
  111 |     await deleteAllChats(page);
  112 |     // Create at least one chat
  113 |     const chat1 = await createNewChat(page, 1);
  114 |     // Reload to simulate fresh login
  115 |     await page.reload();
  116 |     // The first chat should be active
  117 |     const activeChat = await page.locator('nav [data-active="true"]').first();
  118 |     const activeChatText = await activeChat.textContent();
  119 |     expect(activeChatText).toContain(chat1);
  120 |     expect(true).toBe(true);
  121 |   });
  122 |
  123 |   test('shows new chat component if no chats exist', async ({ page }) => {
  124 |     await login(page);
  125 |     await deleteAllChats(page);
  126 |     await expect(page.locator('text=Start your new conversation by sending a message.')).toBeVisible();
  127 |   });
  128 | });
  129 |
  130 | test.describe('Chat ordering', () => {
  131 |   test('sending a message moves chat to top', async ({ page }) => {
  132 |     await login(page);
  133 |     await deleteAllChats(page);
  134 |     // Create two conversations
  135 |     const chat1 = await createNewChat(page, 1);
  136 |     const chat2 = await createNewChat(page, 2);
  137 |     // Select the second chat and send a message
  138 |     await page.click(`nav >> text=${chat2}`);
  139 |     await page.fill('textarea, input[name="newMessageText"]', 'Hello from chat 2');
  140 |     await page.click('button:has-text("Send")');
  141 |     // Wait for message to appear in chat history
  142 |     await page.waitForSelector('text=Hello from chat 2');
  143 |     // Reload and check chat order
  144 |     await page.reload();
  145 |     await page.waitForSelector('nav');
  146 |     const firstChat = await page.locator('nav [role="listitem"]').first();
> 147 |     const firstChatText = await firstChat.textContent();
      |                                           ^ Error: locator.textContent: Test timeout of 30000ms exceeded.
  148 |     expect(firstChatText).toContain(chat2);
  149 |   });
  150 | }); 
```