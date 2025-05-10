---
id: compress-large-images
priority: high
estimate: 3h
status: ready
---

## Problem Statement
Currently, uploading large images (>1MB or above a certain pixel dimension) can cause timeouts or 400 errors. This degrades user experience and may waste storage/bandwidth.

## Outcome / Goal
All images uploaded by users are automatically compressed (by file size and/or dimensions) before being saved, ensuring uploads are reliable and storage is efficient.

## User Story
As a user, I want to upload images of any size, so that my uploads never fail due to size limits and the app remains fast and reliable.

## Acceptance Criteria
- Given a user uploads an image >1MB or above the defined pixel size,  
  When the upload is processed,  
  Then the image is compressed to ≤1MB and/or within the max dimensions before saving.
- Given a user uploads an image already under the limits,  
  When the upload is processed,  
  Then the image is saved as-is, with no unnecessary recompression.
- Given a user uploads a very large image,  
  When the upload is processed,  
  Then the upload does not time out or return a 400 error.
- Compression preserves reasonable image quality (no excessive artifacts).
- The backend enforces these limits regardless of frontend behavior.
- All relevant tests (unit/integration) are updated or added.

## Impact Analysis
- Likely files:  
  - `backend/controllers/` (image upload endpoint)  
  - `backend/services/` (image processing logic)  
  - `backend/utils/` (add or update image compression utility)  
  - `frontend/src/components/` (optional: preview compression client-side for UX)
- May require new dependency (e.g., `sharp` for Node.js image processing).
- No schema or env var changes expected.

## Implementation Hints
- Use `sharp` (Node.js) for backend image resizing/compression.
- Set max file size (e.g., 1MB) and max dimensions (e.g., 1920x1080px).
- Consider compressing on the backend for security and consistency.
- Optionally, preview compression client-side for instant feedback.

## Testing Requirements
- Unit:  
  - Test image compression utility with various input sizes/types.
- Integration:  
  - Test upload endpoint with large, small, and edge-case images.
- E2E:  
  - Simulate user uploading large images and verify successful upload and display.
- Non-functional:  
  - Confirm no significant quality loss; check performance for large files.

## Out-of-Scope
- No changes to image storage schema.
- No support for non-image file types.

## Risks & Mitigations
- Risk: Over-compression may degrade image quality.  
  Mitigation: Tune compression settings and add tests for visual quality.
- Risk: New dependency may increase build size.  
  Mitigation: Use only production-ready, well-maintained libraries.

## Definition of Done
- [ ] Large images are reliably compressed and saved under the set limits.
- [ ] No timeouts or 400 errors for large image uploads.
- [ ] All relevant tests pass and cover new logic.
- [ ] Any new dependencies are documented and installed in `/backend`.
- [ ] Update summary includes all file and dependency changes. 