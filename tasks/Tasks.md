# Wishlist
- [ ] Let the user store things to long-term memory during a chat, perhaps by explicitly asking for it.
- [ ] Add Dark/Light theme.  
- [ ] Make session management optional through a "Remember Me" toggle.  
- [ ] Save memories based on what the bot sees in photos or what I say. (RAG) **(Hard)**  
- [ ] Make image paste with ⌘ + V work. *(Small)*  
- [ ] Add "global data" preferences for the user: what they're looking for and ways to connect with girls through commonalities.  
- [ ] Make the bot respond in Markdown.  
- [ ] Implement a free trial for the Stripe membership.  
- [ ] When uploading Tinder photos, extract and save tags/info from the description and profile.  
- [ ] Build a React Native app for mobile. **(Hard)**  
- [ ] Upload user chats to mimic their style. **(Mid)**  
- [ ] Hacer un tear down de la DB que elimine todos los users de prueba?
- [ ] The UI should be reactive and update when you do things in other devices.
- [ ] Manage true test isolation for the E2E tests.
- [ ] Maybe I should create the user just after the email is verified. To prevent DB spam.
- [ ] Hacer mas solido el flow de confirmacion de emails. Para que puedan re-pedir el mail de confirmacion.

# To-Do
## Code Quality
- [ ] Create an audit / architect-mode rule that I can insert manually.  
- [ ] Set up CI environment.  
- [ ] Make it so that E2E tests use a much smaller model to save on costs.
- [ ] The loading animation isn't starting as soon as I send my images. It should also start optimistically. 
- [ ] Add prettier so that we keep consistent styling. Add prettier to husky?
- [ ] Fix the ugly messages that I get when the tests run.
- [ ] Get to a good number of test coverage in the backend.
- [ ] Understand, refactor and improve the frontend.
- [ ] Migrate frontend to typescript.

## Features
- [ ] Replace the confirmation alert for deleting a message with a nicer component. *ux*
- [ ] Add an easy user feedback loop. *growth* 

## Polish 
- [ ] Enter should send the message even if there's only an image and no text.
- [ ] Improve the email that users get from Supabase.
- [ ] Add a custom nickname to the thread based on the initial message and image. *(Small) (Fix)*  
- [ ] Add login/signup with google. *ux*

# Today
- [ ] Improve prompt engineering: better responses, shorter texts, and suggestions to naturally split long messages into 2–3 parts. *important*
- [ ] Improve "Pricing" aka payment page. *ux*
- [ ] Add visitor and user tracking. *growth*

# Doing
- [ ] I should be able to send a photo without a text message. *bug*

# Done
- [x] Add a favicon. *ux* 
- [x] Create a logo for the app. 
- [x] Make sure Stripe works in production.  *important*
- [x] A paid user shouldn't be able to access /subscribe
- [x] Test the stripe subscription flow.
- [x] Landing page loads and primary CTA works
- [x] User can register, login, and logout
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
- [x] Make sure the LLM knows which project to use in Supabase instead of defaulting to the first one.
- [x] The last chat you interacted with should move to the top on the left.  
- [x] Log-in with no chats should open the app in the "new chat" component.
- [x] Build the next version of my task manager.  
- [x] Fix frontend tests.  
- [x] Fix optimistic image preview bug 
- [x] When I add images in the web or send a new message, we should scroll to the bottom. 
- [x] Extract the Subscribe page into its own component.
- [x] Authenticated user is redirected to `/app`
- [x] Unsubscribed user is redirected to `/subscribe` and can complete the subscription flow
- [x] Subscribed user is redirected away from `/subscribe`
- [x] Test all Auth guards
- [x] Refactor other tests to use getByTestId()
- [x] User can start a new chat, send a message, and see it appear
- [x] User can rename a conversation
- [x] User can delete a conversation
- [x] User can upload an image in chat and see the preview
- [x] Refreshing the app restores the last active chat
- [x] Handle large images (currently times out with a 400 error); maybe resize images. 
- [x] Solve mailtrap integration (upgrade?)
- [x] Establish a proper way to run supabase migrations and bring the production schema into a single initializer migration commited to git. 
- [x] Agregar MCP de Context7
- [x] Configure the production environment to have a separate database. 
- [x] Registration should give feedback and guide through the flow *ux*  
- [x] The instant preview is showing two messages after sending a message. One with the text and one with the text and image. *bug*
