---
id: e2e-coverage-before-frontend-refactor
priority: high
estimate: 4h
status: ready
---

# Add comprehensive E2E test coverage for core frontend flows before refactor

**Problem Statement:**
The frontend is about to undergo a major refactor (routing, page structure, context, hooks). Without robust E2E tests, regressions or broken user flows may go undetected.

**Outcome / Goal:**
All critical user journeys are protected by Playwright E2E tests, providing a safety net for the upcoming refactor.

**User Story:**
As a developer, I want reliable E2E tests for the main app flows so that I can refactor the frontend with confidence and catch regressions early.

**Acceptance Criteria:**
- [ ] E2E tests are written using Playwright (run from `frontend/`)
- [ ] Tests cover the following user journeys:
    - [x] Landing page loads and primary CTA works
    - [ ] User can register, login, and logout
    - [ ] Authenticated user is redirected to `/app`
    - [ ] Unsubscribed user is redirected to `/subscribe` and can complete the subscription flow
    - [ ] Subscribed user is redirected away from `/subscribe`
    - [ ] User can start a new chat, send a message, and see it appear
    - [ ] User can upload an image in chat and see the preview
    - [ ] User can rename and delete a conversation
    - [ ] Refreshing the app restores the last active chat
    - [ ] Error and loading states are handled gracefully (e.g., failed API, slow network)
- [ ] E2E tests run green in CI and locally

**Impact Analysis:**
- `frontend/` (Playwright test files, config)
- May require test user accounts and/or Stripe test keys
- No backend or database schema changes required

**Implementation Hints:**
- Use Playwright's UI selectors and test IDs for stability
- Mock Stripe/test payment flows if possible
- Use Playwright's storage state for login flows
- Add a `test:e2e` script to `frontend/package.json` if missing

**Testing Requirements:**
- E2E: All above flows
- Non-functional: Test on both desktop and mobile viewport

**Out-of-Scope:**
- Full visual regression testing
- Non-critical edge cases

**Risks & Mitigations:**
- Risk: Flaky tests due to async flows → Use proper waits and retries
- Risk: Test data pollution → Use test accounts and clean up after tests

**Definition of Done:**
- [ ] All listed E2E flows are covered
- [ ] Tests pass locally and in CI
- [ ] Task checklist is updated and closed 