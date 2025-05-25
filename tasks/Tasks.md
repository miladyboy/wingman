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
- [ ] Add somehow localization to the prompts. For example in spanish not using the initial question or exclamation sign. Maybe run a small local model and from that dinamically add a specific language prompt. _ux_
- [ ] Only show cookies banner to users from the EU and relevant jurisdictions _legal_
- [ ] Hacer un modulo de post-processing del mensaje del user antes de mandarlo como prompt (para que openai no joda)
- [ ] Refactor analyzecontroller.ts pq tiene 500 lineas
- [ ] Agregar https://www.promptfoo.dev/docs/intro/ para mejorar la seguridad de los prompts.

# Next features

- [ ] Tener una feature "modo aprendizaje" que te explica porque hace sentido cada mensaje para ir aprendiendo _pro feature_
- [ ] Feature para one click resumen de cada piba y su historial _pro feature_
- [ ] Feature para usar @ para citar otros chats y relacionar chats sabiendo que son la misma piba _pro feature_
- [ ] CRM + Recordatorios para reengagear o marcar como concretada la date. _pro feature_
- [ ] Input de texto por voz ??(no necesario maybe) _pro feature_
- [ ] Context Chips: Small badges above the typing area: 🔥 High Interest, 🚩 Red Flag, etc. Clicking a chip auto-inserts context hints into the next prompt. Chips map to hidden text snippets that prepend to latestMessage.

# To-Do

- [ ] The test suite seems flaky AF (The E2E tests)
- [ ] Remove "nickname" from the profile table.
- [ ] Add more user flows to the E2E suite up to 25-30 tests. _tests_
- [ ] Make the E2E suite run in the three browsers. _test_
- [ ] Create an audit / architect-mode rule that I can insert manually. _code-quality_
- [ ] Make it so that E2E tests use a much smaller model to save on costs. _cost_
- [ ] Add prettier so that we keep consistent styling. Add prettier to husky? _code-quality_
- [ ] Get to a good number of test coverage in the backend. _code-quality_
- [ ] Understand, refactor and improve the frontend. _code-quality_
- [ ] Migrate frontend to typescript. _code-quality_
- [ ] Enter should send the message even if there's only an image and no text. _ux_
- [ ] Delete el chat optimisticamente de la UI.
- [ ] Add an easy user feedback loop. _growth_
- [ ] Add pino for logging.
- [ ] Implement the AI lib from Vercel so that I can update which language I use for different things. _code-quality_
- [ ] Add "re-roll" button for llm answers (use MessageBranching.md to kickstart) _Mau_
- [ ] Somehow create a way for the user to copy the message that the LLM is sending with one click. _UX_
- [ ] Add like or dislike button to improve llm answers _Prompt quality_
- [ ] Do a security review _security_
- [ ] Let users delete their accounts and all their data.
- [ ] Add E2E test that user can cancel their subscription _e2e_
- [ ] Add 2FA to all Supabase and Cloud accounts _security_
- [ ] Try to do a mobile frontend with Expo / React Native. _dev_
- [ ] Divide the user preferences into multiple fields: Things that I like, Thinks I'm looking for in a girl, Conversation style I prefer. _ux_
- [ ] Practice using the app and improve prompt engineering.
- [ ] Add E2E tests that the backend is properly processing images.
- [ ] Add E2E tests for multi-step conversations.
- [ ] Add E2E tests for the dots to load as soon as the conversation starts.
- [ ] Make the buckets private to avoid data issues. _legal_
- [ ] Mejorar critique agent prompt _prompt_
- [ ] Implementar sistema de loging de chats y mejora con feedback/rating de usuarios _prompt_
- [ ] Ver si implementar task master asi: https://x.com/antonioc_cl/status/1919861669158650305
- [ ] Tarda mas tiempo de lo normal en devolver el poder al usuario para escribir un mensaje, despues de haber respondido el agente.

# Doing

<<<<<<< HEAD
- [ ] Set up CI environment. _code-quality_
- [ ] Setup Cursor background agents. _code-quality_

# Done

- [x] Give feedback about the new subscription page
- [x] Update stripe to charge weekly instead of monthly. _money_
- [x] Move the Supabase DBs to the EU
- [x] Setup reverse proxy para las stats de usuarios. Make sure we're getting the stats. _marketing_
- [x] Send my personal data to the stripe peple so they keep accepting money.
- [x] Create cancel subscription flow _money_
- [x] Fix so that users can send an image in the first message. _bug_
- [x] Fix nickname generation. It adds "" to it.
- [x] Fix drag and drop of images into the upload component.
=======
# Done
>>>>>>> main
