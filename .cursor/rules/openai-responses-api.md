# Cursor Rule — Use the **Responses API**, Retire the Completions API

> **Scope**  
> Every time you send a prompt to OpenAI from this codebase, it **must** go through the new **Responses API** (`client.responses.create`) rather than any legacy *Chat/Completions* endpoints.

---

## 1  SDK Version Requirement
- Ensure `openai` ≥ **4.96.0**  
  ```bash
  npm i openai@latest
  ```

---

## 2  Canonical Call Pattern

```ts
import { OpenAI } from "openai";
const client = new OpenAI();

const res = await client.responses.create({
  model: "gpt-4o",
  input: [
    { role: "user", content: "Hello there!" }
  ],
  stream: true   // or false if you prefer a single blob
});
```

### Handling Streams
```ts
for await (const chunk of res) {
  // chunk.choices[0].delta.content ...
}
```

---

## 3  Key Differences vs. Completions

| Completions Param | Responses Replacement | Notes |
|-------------------|-----------------------|-------|
| `messages`        | `input`               | Same array schema. |
| `functions` / `tools` | Not yet supported  | Stub out or migrate your tool-calling logic. |
| `stream` (2nd arg) | `stream` (same object) | Now lives in the main options object. |

---

## 4  Migration & Enforcement Steps

1. **New Code** – only use `client.responses.create`.  
2. **Touching Legacy Code** – when editing a file that still calls Completions, migrate it *immediately* and note the change in your “What I just tweaked” section.  
3. **Lockfiles are Sacred** – commit `package-lock.json` / `pnpm-lock.yaml` so the exact SDK version is deterministic.  
4. **Exceptions** – the *only* valid reason to stay on Completions is when the Responses API lacks a required feature **and** you document that reason in-line and in the commit message.

---

## 5  TL;DR

> Any hit to `client.chat.completions.*` or `client.completions.*` is now considered **technical debt**—upgrade on sight.  
> The Responses API is our default, streaming-friendly, future-proof endpoint. Keep it that way.
