# Done

- [x] The loading dots animation is broken again. _bug_ **important**
- [x] Replace the confirmation alert for deleting a message with a nicer component. _ux_
- [x] Improve "Pricing" aka payment page. _growth_
- [x] Improve user logo at the top right corner. Make it a component to be reutilizable. It looks small and it's hard to find. _UX_
- [x] Add text bubble to the llm replies _UI_
- [x] Separar un poco el boton de "new chat" del limite superior
- [x] Make sure the experience works correctly in mobile _ux_
- [x] Add so that the E2E suite runs on husky push.
- [x] Improve prompt engineering: better responses, shorter texts, and suggestions to naturally split long messages into 2–3 parts. _prompt_
- [x] Add to the system prompt how it should treat different pictures. There are three types, photos, conversations and metadata (Like tinder stats)
- [x] The loading animation isn't starting as soon as I send my images. It should also start optimistically. _ux_
- [x] Make the E2E suite go to green again.
- [x] Se sigue renderizando dos veces el mensaje de preview algunas veces _bug_
- [x] No se esta mostrando el reply hasta que hago un refresh. _bug_
- [x] Improve the prompt that tries to generate a nickname to make sure that it extracts a name if at all possible. Name + 1-3 words that describe her, otherwise just the descriptive words. Fix the feature as well.
- [x] Add visitor and user tracking. _growth_
- [x] I should be able to send a photo without a text message. _bug_
- [x] Add a favicon. _ux_
- [x] Create a logo for the app.
- [x] Make sure Stripe works in production. _important_
- [x] A paid user shouldn't be able to access /subscribe
- [x] Test the stripe subscription flow.
- [x] Landing page loads and primary CTA works
- [x] User can register, login, and logout
- [x] Implement streaming API.
- [x] Add a complete project rule teaching the LLM to use GitHub.
- [x] Add automated testing to part of the backend (testing).
- [x] Make image upload a drag-and-drop zone. _(Small)_
- [x] Remove or improve the _App_ component test.
- [x] Prevent a new thread from being created until the first message is processed. **(Mid) (Important)**
- [x] Set up Husky.
- [x] Remove the image description from the bot reply.
- [x] Save image description info for all uploaded photos. **(Hard)**
- [x] Verify that multiple image uploads work. **(Mid)**
- [x] Store actual photos in the database and display them in the chat. **(Mid)**
- [x] Fix images not displaying in the chat after a refresh. _(Bug)_
- [x] Deploy the site on a custom domain.
- [x] Enable Fran to use the product.
- [x] Set up initial unit testing.
- [x] Save actual images in the database and show them in the UI on the right. **(Hard)**
- [x] Pressing **Enter** in the chat input sends the message. _(Small)_
- [x] Add _shadcn_ components for better styling.
- [x] Create a landing page.
- [x] Add routing to the app.
- [x] Remove unused _App.js_ file.
- [x] Fix name editing.
- [x] Allow deleting a conversation and removing everything from the database. _(Small) (Important)_
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
- [x] Registration should give feedback and guide through the flow _ux_
- [x] The instant preview is showing two messages after sending a message. One with the text and one with the text and image. _bug_
- [x] The "loading" wheel disapeared and is not showing. _bug_
- [x] Make sure the loading dots appear just as soon as the user hits send.
- [x] Let the user add their preferences in a message. What they're looking for, what they like, etc. Use that as part of the prompt.
- [x] Improve prompting: The system prompt should consider three modes: Opening, Continuing conversation, or re-engaging.
- [x] Add to the system prompt how it should treat when it receives multiple images at a time. It should treat them as a whole, as the user is asking for something together.
- [x] Fix automatic deploy de Render. _code-quality_
- [x] Add running the E2E tests to the git push _code-quality_
- [x] Register for the apple store
- [x] The mobile icon for new chat should be the same in the sidebar as in the top right.
- [x] Make it so that users can suspend their membership.
- [x] Call less attention to the logout button. Hide it behind a settings button maybe.
- [x] Improve prompting to use system/user roles instead of just a single string. **important** _llm_
- [x] Fix the E2E tests to run with multiple workers. _test_ **important**
- [x] Perfect the Landing Copywright _growth_
- [x] Add a search for the threads to find a specific girl name.
- [x] Add "global data" preferences for the user: what they're looking for and ways to connect with girls through commonalities.
- [x] Add login/signup with google. _ux_
- [x] Fix UI in mobile, it hides the menu. _bug_
- [x] Do a privacy policy _legal_
- [x] Do the terms and conditions for the app. _legal_
- [x] Link to the terms and privacy from the landing page.
- [x] Fix the ugly messages that I get when the tests run. _code-quality_
- [x] Fix nickname generation. It adds "" to it.
- [x] Fix drag and drop of images into the upload component.
- [x] Give feedback about the new subscription page
- [x] Update stripe to charge weekly instead of monthly. _money_
- [x] Move the Supabase DBs to the EU
- [x] Setup reverse proxy para las stats de usuarios. Make sure we're getting the stats. _marketing_
- [x] Send my personal data to the stripe peple so they keep accepting money.
- [x] Create cancel subscription flow _money_
- [x] Fix so that users can send an image in the first message. _bug_
- [x] Agregar columnas de prefered language y simp level a database de prod.
