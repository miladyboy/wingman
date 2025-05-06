---
id: fix-optimistic-image-preview
priority: medium
estimate: 2h
status: ready
---

## Problem Statement
The optimistic image preview in the chat UI appears briefly after upload but then disappears, only showing correctly after a full page refresh. This breaks the user experience for image uploads.

## Outcome / Goal
Users should see a persistent, accurate image preview immediately after uploading, without needing to refresh the page.

## User Story
As a user uploading an image in chat, I want the preview to remain visible and accurate after upload so that I can confirm my image was successfully added before sending or refreshing.

## Acceptance Criteria
- Given I upload an image in chat,  
  When the upload completes,  
  Then the image preview should remain visible and not disappear.
- Given I upload an image,  
  When I refresh the page,  
  Then the image should still be visible (regression check).
- Given I upload an image,  
  When the upload fails,  
  Then I should see an error or fallback, not a disappearing preview.

## Impact Analysis
- Likely impacted files:  
  - `frontend/src/components/` (chat UI, image preview component)
  - `frontend/src/lib/` (upload logic, state management)
  - Any optimistic update logic (possibly Redux, Zustand, or React Context)
- No backend changes expected unless the bug is related to API response timing.
- No new environment variables or migrations required.

## Implementation Hints
- Review how optimistic updates are handled for image uploads.
- Ensure local state is not being reset or overwritten by a stale server response.
- Consider using a unique temporary ID for optimistic images and reconciling with the server response.
- Add clear error handling for failed uploads.

## Testing Requirements
- **Unit**: Test the image preview component's state transitions (uploading, success, failure).
- **Integration**: Simulate an image upload and verify the preview remains visible.
- **E2E**: Use Playwright/Cypress to upload an image and check for persistent preview without refresh.
- **Regression**: Ensure image preview after refresh still works.

## Out-of-Scope
- Changes to backend image storage or API unless a root cause is found there.
- UI redesign of the image preview component.

## Risks & Mitigations
- Risk: The bug may be due to race conditions between optimistic UI and server state.  
  Mitigation: Add logging and step through state transitions to confirm.
- Risk: Fix may introduce duplicate images if not reconciled properly.  
  Mitigation: Use unique IDs and reconcile on server response.

## Definition of Done
- [ ] Image preview remains visible after upload without refresh.
- [ ] No duplicate images appear after upload.
- [ ] All relevant tests (unit, integration, E2E) pass.
- [ ] No regression in image preview after refresh.
- [ ] No unused code or imports left behind.
- [ ] Change is committed with a clear message and included in the next release. 