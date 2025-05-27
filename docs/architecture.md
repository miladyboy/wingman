# Backend Architecture Overview

This document gives a high-level view of the Node/Express backend contained in the `backend/` folder. Only the parts needed by day-to-day contributors are covered – for low-level implementation details please read the inline code-comments and tests.

## Layered Structure

```
┌───────────────────────────┐
│ Routes (Express routers)  │  – HTTP surface
├───────────────────────────┤
│ Controllers               │  – Orchestrate request → response
├───────────────────────────┤
│ Services                  │  – Pure domain logic  ←  ★ NEW SECTION
├───────────────────────────┤
│ Utils / Helpers           │  – Stateless, reusable helpers
└───────────────────────────┘
```

- **Routes**: Thin Express routers that attach middleware, parse form-data and forward to controllers.
- **Controllers**: Contain the orchestration flow. They must not worry about where data comes from. All side-effects (DB, external APIs) must be delegated to a service.
- **Services**: The core domain layer. They expose **pure functions / classes** that encapsulate a single responsibility (OpenAI calls, Stripe, Supabase, etc.). Everything here is unit-testable in isolation.
- **Utils / Helpers**: Simple stateless helpers used by many services.

## Services Layer (detailed)

Historically every controller used `supabaseAdmin` directly which made them large and hard to unit-test. We have been refactoring those DB interactions into dedicated **service modules**. Two key services exist today:

| Service          | Responsibility                                                                     | Public API                           |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| `authService.ts` | Authentication & authorisation logic – verifying JWTs, generating OAuth URLs, etc. | `verifyToken()` `generateOAuthUrl()` |
| `userService.ts` | User-domain data – profile rows & preference rows. No auth logic lives here.       | `getProfile()` `getPreferences()`    |

Guidelines:

1. **Single domain per service** – avoid God-classes. If you need to touch Stripe, put it in `stripeService.ts`, not in userService.
2. **No Express objects** – service functions receive plain arguments (`userId: string`) and return plain values/promises. This keeps them framework-agnostic and extremely easy to test with Jest.
3. **No logging side-effects** – leave request logging to controllers; services may `throw` errors which bubble up.
4. **Default handling** – a service must guarantee sensible defaults so that controllers can keep logic minimal.
5. **Mock-friendly** – by always taking an optional `SupabaseClient` (or similar) parameter, tests can inject mocks without touching globals.

### Example Usage

```ts
// controller
import { getPreferences } from "../services/userService";

...
const prefs = await getPreferences(req.auth.userId);
const fullPrompt = buildFullPrompt({
  userPreferences: prefs.text,
  preferredCountry: prefs.preferredCountry,
  simpPreference: prefs.simpPreference,
  ...otherContext,
});
```

### Benefits Achieved So Far

- **Controllers slimmer** – `analyzeController.ts` dropped ~80 LOC.
- **Unit coverage** – userService now has ≥ 90 % coverage with exhaustive edge-cases.
- **Future proof** – Should we migrate away from Supabase, the swap happens inside service modules only.

---

_Last updated: 2025-05-27_
