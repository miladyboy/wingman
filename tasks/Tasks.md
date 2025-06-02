# Wishlist

- [ ] Let the user store things to long-term memory during a chat, perhaps by explicitly asking for it.
- [ ] Add Dark/Light theme.
- [ ] Make session management optional through a "Remember Me" toggle.
- [ ] Save memories based on what the bot sees in photos or what I say. (RAG) **(Hard)**
- [ ] Make the bot respond in Markdown.
- [ ] Implement a free trial for the Stripe membership.
- [ ] When uploading Tinder photos, extract and save tags/info from the description and profile.
- [ ] Build a React Native app for mobile. **(Hard)**
- [ ] Hacer un tear down de la DB que elimine todos los users de prueba?
- [ ] The UI should be reactive and update when you do things in other devices.
- [ ] Manage true test isolation for the E2E tests.
- [ ] Maybe I should create the user just after the email is verified. To prevent DB spam.
- [ ] Hacer mas solido el flow de confirmacion de emails. Para que puedan re-pedir el mail de confirmacion.
- [ ] Fix the manifest.json and everything so that it works as a PWA
- [ ] Implement google vision to extract the girls names. OpenAI screams.
- [ ] Add success screen or toast component after they successfully pay their subscription.
- [ ] Add somehow localization to the prompts. For example in spanish not using the initial question or exclamation sign. Maybe run a small local model and from that dinamically add a specific language prompt. _ux_
- [ ] Only show cookies banner to users from the EU and relevant jurisdictions _legal_
- [ ] Hacer un modulo de post-processing del mensaje del user antes de mandarlo como prompt (para que openai no joda)
- [ ] Agregar https://www.promptfoo.dev/docs/intro/ para mejorar la seguridad de los prompts.
- [ ] Make the E2E suite run in the three browsers. (It might be expensive) _test_

# Next features

- [ ] Upload user chats to mimic their style. **(Mid)**
- [ ] Tener una feature "modo aprendizaje" que te explica porque hace sentido cada mensaje para ir aprendiendo _pro feature_
- [ ] Feature para one click resumen de cada piba y su historial _pro feature_
- [ ] Feature para usar @ para citar otros chats y relacionar chats sabiendo que son la misma piba _pro feature_
- [ ] CRM + Recordatorios para reengagear o marcar como concretada la date. _pro feature_
- [ ] Input de texto por voz ??(no necesario maybe) _pro feature_
- [ ] Context Chips: Small badges above the typing area: 🔥 High Interest, 🚩 Red Flag, etc. Clicking a chip auto-inserts context hints into the next prompt. Chips map to hidden text snippets that prepend to latestMessage.

# To-Do

- [ ] Set up CI environment. _code-quality_
- [ ] Create an audit / architect-mode rule that I can insert manually. _code-quality_
- [ ] Add prettier so that we keep consistent styling. Add prettier to husky? _code-quality_
- [ ] Get to a good number of test coverage in the backend. _code-quality_
- [ ] Understand, refactor and improve the frontend. _code-quality_
- [ ] Enter should send the message even if there's only an image and no text. _ux_
- [ ] Delete el chat optimisticamente de la UI. _ux_
- [ ] Add an easy user feedback loop. _growth_
- [ ] Add pino for logging.
- [ ] Implement the AI lib from Vercel so that I can update which language I use for different things. _code-quality_
- [ ] Add "re-roll" button for llm answers (use MessageBranching.md to kickstart)
- [ ] Somehow create a way for the user to copy the message that the LLM is sending with one click. _UX_
- [ ] Add like or dislike button to improve llm answers _prompt quality_
- [ ] Let users delete their accounts and all their data.
- [ ] Try to do a mobile frontend with Expo / React Native. _dev_
- [ ] Divide the user preferences into multiple fields: Things that I like, Thinks I'm looking for in a girl, Conversation style I prefer. _ux_
- [ ] Add E2E tests that the backend is properly processing images.
- [ ] Mejorar critique agent prompt _prompt_
- [ ] Implementar sistema de loging de chats y mejora con feedback/rating de usuarios _prompt_
- [ ] Add accessibility rules to cursor and apply to the app.
- [ ] Remove all spanish from the repo.
- [ ] Add JSDocs to the entire codebase.
- [ ] Keep consistent naming conventions for files in the codebase.
- [ ] Review the tests. To what extent are they tests.
- [ ] Hacer que background agents puedan correr tests y usar git.
- [ ] Disminuir costos en todos los calls de OpenAI.
- [ ] Apply improvements of security review.
- [ ] Improve prompt system to reduce complexity and redundancy. _code-quality_
- [ ] We always get "Failed to fetch user preferences via userService: Error: relation "public.preferences" does not exist" _bug_
- [ ] Make a reusable component for ChatMessage
- [ ] Implement security and privacy improvements.
- [ ] Add 2FA to all Supabase and Cloud accounts _security_
- [ ] Have full encryption of data at rest. The user decrypts it. _privacy_
- [ ] Consistently solve and test the loading dots issue. _bug_
- [ ] Practice using the app and improve prompt engineering and overall UX _ux_

# Doing

- [ ] Arreglar mobile

# Done

- [x] Make the buckets private to avoid data issues. _legal_
- [x] Fix the authentication issue with old tokens. _bug_
- [x] Make the tests use a smaller model to save on costs.
- [x] Mandar data que pide Stripe. _growth_
- [x] Add E2E test that user can cancel their subscription _e2e_
- [x] Give feedback about the new subscription page
- [x] Update stripe to charge weekly instead of monthly. _money_
- [x] Move the Supabase DBs to the EU
- [x] Setup reverse proxy para las stats de usuarios. Make sure we're getting the stats. _marketing_
- [x] Send my personal data to the stripe peple so they keep accepting money.
- [x] Create cancel subscription flow _money_
- [x] Fix so that users can send an image in the first message. _bug_
- [x] Fix nickname generation. It adds "" to it.
- [x] Fix drag and drop of images into the upload component.
- [x] Setup Cursor background agents. _code-quality_
- [x] The test suite seems flaky AF (The E2E tests)
- [x] Pasar la app a Typescript correctamente.
- [x] Refactor analyzecontroller.ts pq tiene 500 lineas
- [x] Remove "nickname" from the profile table.
- [x] Migrate frontend to typescript. _code-quality_
- [x] Add more user flows to the E2E suite up to 30 tests. _tests_
- [x] Add E2E tests for multi-step conversations.
- [x] Recargar la cuenta de OpenAI
- [x] Potential bug, if I send a message and a wait a while in the window. The AI reply dissapears. _bug_
- [x] Tarda mas tiempo de lo normal en devolver el poder al usuario para escribir un mensaje, despues de haber respondido el agente. _bug_
- [x] Do a security review _security_
- [x] Agregar Helmet para proteger el server.
- [x] Make it so that E2E tests use a much smaller model to save on costs. _cost_
