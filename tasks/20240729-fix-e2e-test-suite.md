---
id: fix-e2e-test-suite
priority: high
estimate: 4h-8h (depending on the root cause)
status: ready
---

## 1. Problem Statement
The End-to-End (E2E) test suite is currently failing or unreliable, preventing automated verification of critical user flows and increasing the risk of deploying broken features.

## 2. Outcome / Goal
The E2E test suite consistently passes in local and CI environments, providing reliable feedback on the application's stability.

## 3. User Story
As a developer, I want a stable and reliable E2E test suite so that I can confidently merge and deploy changes knowing that core application functionality remains intact.

## 4. Acceptance Criteria
- **Given** the E2E test suite is executed (e.g., `npm run test:e2e --prefix frontend` or via the root script `run-e2e.sh`)
  - **When** all tests complete
  - **Then** all tests should pass.
- **Given** a known failing E2E test scenario
  - **When** the underlying bug is fixed or the test is updated
  - **Then** the specific test should pass.
- **Given** the E2E tests are run
  - **When** they complete
  - **Then** there should be no console errors or warnings specifically originating from the test setup or execution (application errors under test are acceptable if they are being asserted).
- **Given** tests require specific environment setup (e.g., test users, data)
  - **When** tests are run
  - **Then** setup and teardown processes should be reliable and not interfere with other tests or environments.

## 5. Impact Analysis
- **Files/Modules Likely Touched:**
    - `frontend/tests/e2e/` (all spec files within this directory)
    - `frontend/playwright.config.js` (or `playwright.config.ts`)
    - Potentially any components or pages targeted by the failing tests if the issue is in the application code.
    - `frontend/package.json` (scripts related to E2E testing)
    - `run-e2e.sh` (if the execution script itself is problematic)
    - `.github/workflows/` (if CI execution is failing)
- **Migrations, Env Vars, Deployment Changes:**
    - Possibly `frontend/.env.example` or actual `.env` files if environment configuration is an issue for tests.
    - No direct database migrations expected, but test data setup might need review.
    - No direct deployment changes, but fixing E2E tests is a prerequisite for safer deployments.

## 6. Implementation Hints (General - investigate specific failures first)
- **Investigate Failures:**
    - Run tests locally to observe failures.
    - Check Playwright reports (HTML, traces) for detailed error messages, screenshots, and action logs.
    - Examine console output during test runs for errors.
- **Common Issues:**
    - **Selectors:** Ensure `data-testid` attributes or other selectors are stable and correct (see `testing-data-attributes.mdc`).
    - **Timing/Async:** Flaky tests might be due to improper handling of asynchronous operations (e.g., not waiting for elements to appear/disappear, network requests to complete). Use Playwright's auto-waiting capabilities, web assertions (`expect(locator).toBeVisible()`), or explicit waits where necessary.
    - **Environment:** Differences between local and CI environments. Ensure consistent Node.js versions, browser versions (if not managed by Playwright), and environment variables.
    - **Test Data:** Ensure tests are isolated and don't depend on mutable shared state or data from previous test runs. Implement proper setup and teardown for test data.
    - **Application Bugs:** The tests might be correctly identifying actual bugs in the application.
- **Debugging:**
    - Use `PWDEBUG=1 npx playwright test` to run in debug mode.
    - Add `await page.pause()` in your test to inspect the browser state.
- **Playwright Version:** Ensure you are using a recent and stable version of Playwright.

## 7. Testing Requirements
- **Unit:** Not directly applicable for fixing the E2E suite itself, but underlying component fixes might need unit tests.
- **Integration / E2E:** The primary goal is to make the existing E2E tests pass. New E2E tests might be added if significant gaps are found during the fixing process.
- **Non-functional:** Ensure tests are not excessively slow.

## 8. Out-of-Scope
- Major refactoring of the E2E test suite architecture (unless it's the root cause of widespread failures).
- Adding comprehensive E2E test coverage for all new features (focus is on fixing existing suite).
- Optimizing E2E test execution time significantly (unless slow tests are causing timeouts/failures). The task `Make it so that E2E tests use a much smaller model to save on costs.` is separate.

## 9. Risks & Mitigations
- **Risk:** Root cause of failures is difficult to identify.
  - **Mitigation:** Systematically isolate failing tests, use Playwright's debugging tools, review recent code changes that might correlate with test failures.
- **Risk:** Fixing one test breaks another (due to shared state or dependencies).
  - **Mitigation:** Ensure test isolation; refactor shared setup/teardown logic carefully.
- **Risk:** Tests are flaky due to inherent application timing issues.
  - **Mitigation:** Improve assertions to be more resilient, potentially refactor application code for better testability.

## 10. Definition of Done
- [ ] All tests in the E2E suite pass consistently when run locally.
- [ ] All tests in the E2E suite pass consistently in the CI environment (if applicable).
- [ ] Playwright reports show no unexpected errors or warnings.
- [ ] Any application code changes made to fix tests are themselves tested (unit/integration) if appropriate.
- [ ] The `Tasks.md` item `Fix the E2E suite` is marked as done.
- [ ] A brief summary of the root causes and fixes is provided in the pull request. 