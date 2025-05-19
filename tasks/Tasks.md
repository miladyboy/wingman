# Wishlist
- [ ] Let the user store things to long-term memory during a chat, perhaps by explicitly asking for it.
- [ ] Add Dark/Light theme.  
- [ ] Make session management optional through a "Remember Me" toggle.
- [ ] Save memories based on what the bot sees in photos or what I say. (RAG) **(Hard)**  
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
- [ ] Improve security of the images by keeping them either encrypted or in a private bucket. Figure out how to work it out with OpenAI.
- [ ] Fix the manifest.json and everything so that it works as a PWA
- [ ] Implement google vision to extract the girls names. OpenAI screams.
- [ ] Add success screen or toast component after they successfully pay their subscription.
- [ ] Add somehow localization to the prompts. For example in spanish not using the initial question or exclamation sign. Maybe run a small local model and from that dinamically add a specific language prompt. *ux*
- [ ] Only show cookies banner to users from the EU and relevant jurisdictions *legal*

# To-Do
- [ ] Remove "nickname" from the profile table.
- [ ] Add more user flows to the E2E suite up to 25-30 tests. *tests*
- [ ] Make the E2E suite run in the three browsers. *test*
- [ ] Create an audit / architect-mode rule that I can insert manually.  *code-quality*
- [ ] Set up CI environment. *code-quality*
- [ ] Make it so that E2E tests use a much smaller model to save on costs. *cost*
- [ ] Add prettier so that we keep consistent styling. Add prettier to husky? *code-quality*
- [ ] Get to a good number of test coverage in the backend. *code-quality*
- [ ] Understand, refactor and improve the frontend. *code-quality*
- [ ] Migrate frontend to typescript. *code-quality*
- [ ] The Nickname is sometimes showing up as "**Nickname:** Abril Star Explorer". It should just be the nickname. *bug*
- [ ] Enter should send the message even if there's only an image and no text. *ux*
- [ ] Delete el chat optimisticamente de la UI.
- [ ] Add an easy user feedback loop. *growth* 
- [ ] Add pino for logging. 
- [ ] Implement the AI lib from Vercel so that I can update which language I use for different things. *code-quality*
- [ ] Add "re-roll" button for llm answers (use MessageBranching.md to kickstart) *Mau*
- [ ] Somehow create a way for the user to copy the message that the LLM is sending with one click. *UX*
- [ ] Add like or dislike button to improve llm answers *Prompt quality*
- [ ] Do a security review *security*
- [ ] Let users delete their accounts and all their data.
- [ ] Add E2E test that user can cancel their subscription *e2e*
- [ ] Add 2FA to all Supabase and Cloud accounts *security*
- [ ] Try to do a mobile frontend with Expo / React Native. *dev*
- [ ] Divide the user preferences into multiple fields: Things that I like, Thinks I'm looking for in a girl, Conversation style I prefer. *ux*
- [ ] Practice using the app and improve prompt engineering.

# Doing
- [ ] Fix so that users can send an image in the first message. *bug*

# Done
- [x] Give feedback about the new subscription page 
- [x] Update stripe to charge weekly instead of monthly. *money*
- [x] Move the Supabase DBs to the EU
- [x] Setup reverse proxy para las stats de usuarios. Make sure we're getting the stats. *marketing*
- [x] Send my personal data to the stripe peple so they keep accepting money.
- [x] Create cancel subscription flow *money*
