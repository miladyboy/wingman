# Supabase & Database Rules
- All database schema changes must be made via migration files committed to git, not direct changes through the Supabase dashboard or MCP. This ensures auditability, reproducibility, and team collaboration.

# Wishlist
- [ ] Let the user store things to long-term memory during a chat, perhaps by explicitly asking for it.

# To-Do (Rest)
- [ ] Make session management optional through a "Remember Me" toggle.  
- [ ] Add Dark/Light theme.  
- [ ] Save memories based on what the bot sees in photos or what I say. **(Hard)**  
- [ ] Upload user chats to mimic their style. **(Mid)**  
- [ ] Build a React Native app for mobile. **(Hard)**  
- [ ] When uploading Tinder photos, extract and save tags/info from the description and profile.  
- [ ] Set up CI environment.  
- [ ] Make image paste with ⌘ + V work. *(Small)*  
- [ ] The bot loses context as the conversation grows—improve this. **(Hard) (Important)**  
- [ ] Build the next version of my task manager.  
- [ ] Test the entire backend.  
- [ ] Fix frontend tests.  
- [ ] Handle large images (currently times out with a 400 error); maybe resize images.  
- [ ] Add "global data" preferences for the user: what they're looking for and ways to connect with girls through commonalities.  
- [ ] Make the bot respond in Markdown.  
- [ ] Add visitor and user tracking.  
- [ ] Add an easy user feedback loop.  
- [ ] Implement a free trial for the Stripe membership.  
- [ ] Create an audit / architect-mode rule that I can insert manually.  
- [ ] Replace the confirmation alert for deleting a message with a nicer component.

# MVP
- [ ] Add a favicon.  
- [ ] Create a logo for the app.  
- [ ] Ensure the email-approval flow works correctly. 
- [ ] Registration should give feedback and a notice to verify email. *(Small)*  
- [ ] Improve prompt engineering: better responses, shorter texts, and suggestions to naturally split long messages into 2–3 parts. **(Mid) (Important)**  
- [ ] Add a custom nickname to the thread based on the initial message and image. *(Small) (Fix)*  

# Doing
- [ ] The last chat you interacted with should move to the top on the left.  

# Done
- [x] Implement streaming API.  
- [x] Add a complete project rule teaching the LLM to use GitHub.  
- [x] Add automated testing to part of the backend (testing).  
- [x] Make image upload a drag-and-drop zone. *(Small)*  
- [x] Remove or improve the *App* component test.  
- [x] Prevent a new thread from being created until the first message is processed. **(Mid) (Important)**  
- [x] Set up Husky.  
- [x] Remove the image description from the bot reply.  
- [x] Save image description info for all uploaded photos. **(Hard)**  
- [x] Verify that multiple image uploads work. **(Mid)**  
- [x] Store actual photos in the database and display them in the chat. **(Mid)**  
- [x] Fix images not displaying in the chat after a refresh. *(Bug)*  
- [x] Deploy the site on a custom domain.  
- [x] Enable Fran to use the product.  
- [x] Set up initial unit testing.  
- [x] Save actual images in the database and show them in the UI on the right. **(Hard)**  
- [x] Pressing **Enter** in the chat input sends the message. *(Small)*  
- [x] Add *shadcn* components for better styling.  
- [x] Create a landing page.  
- [x] Add routing to the app.  
- [x] Remove unused *App.js* file.  
- [x] Fix name editing.  
- [x] Allow deleting a conversation and removing everything from the database. *(Small) (Important)*  
- [x] Migrate backend to TypeScript.  
- [x] Fix deployment failures on Vercel and Render.  
- [x] Generate a style guide or template.  
- [x] Remove bubbles from the agent's response text.  
- [x] Improve the "processing" animation while the bot thinks (less robotic).  
- [x] Create polished MVP landing content and styles.  
- [x] Integrate Cypress or Playwright for automated E2E testing. **(Hard)**  
- [x] Add Stripe integration for payments.  
- [x] Remove text indicating the backend is reviewing subscription status.  
- [x] Refreshing inside the app reopens the last conversation (or at least the first chat).  
- [x] Update the page title.  
- [x] Add linting to both frontend and backend.  
- [x] Log-out redirects to the homepage.  
- [x] Don't always give 2–3 suggestions—sometimes one or a normal reply is enough.
