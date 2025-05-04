---
id: move-chat-to-top
priority: medium
estimate: 2h
status: ready
---

## Problem Statement
Currently, the chat list does not reorder when a user sends a message, making it harder to access active conversations quickly. We want to improve the UX by ensuring the most recently active chats are always at the top, but only when a message is sent.

## Outcome / Goal
Chats move to the top of the sidebar list only when a user sends a message in that chat. Merely opening or viewing a chat does not affect the order.

## User Story
As a user, I want the chat I just sent a message in to move to the top of my chat list so that my most active conversations are always easily accessible.

## Acceptance Criteria
- Given a user sends a message in a chat, when the message is sent, then that chat moves to the top of the chat list.
- Given a user opens or resumes a chat but does not send a message, then the chat order remains unchanged.
- Given the user refreshes the page, then the chat order persists (matches the last message sent order).
- No duplicate chats appear in the list.
- The UI updates instantly (optimistic update) for a smooth experience.

## Impact Analysis
- **Frontend:** Chat list component, message send handler, state management, chat fetching logic.
- **Backend:** Chat/thread model/schema (ensure `lastMessageAt` or similar timestamp), message controller, chat list API endpoint.
- **Persistence:** Ensure chat order is saved and restored (backend or local storage, as appropriate).

## Implementation Hints
- Use a `lastMessageAt` timestamp on each chat/thread.
- Update this timestamp only when a message is sent.
- Sort chats by this timestamp descending in both frontend and backend APIs.
- Do not update order on chat open/view without sending a message.

## Testing Requirements
- **Unit:** Test chat order logic and timestamp updates.
- **Integration:** Test full flow: sending a message moves chat to top, opening without sending does not.
- **Persistence:** Test order after reload.
- **Edge Cases:** Simultaneous updates, deleted/archived chats.

## Out-of-Scope
- Reordering chats when only opening or viewing (without sending a message).
- Changing order based on read/unread status.

## Risks & Mitigations
- **Risk:** Race conditions if multiple devices update at once.  
  **Mitigation:** Use backend as source of truth for ordering.
- **Risk:** UI lag if backend is slow.  
  **Mitigation:** Use optimistic updates in the frontend.

## Definition of Done
- [ ] Chats move to top only when a message is sent.
- [ ] Order persists after reload.
- [ ] No duplicates or missing chats.
- [ ] Tests cover all acceptance criteria and edge cases.
- [ ] Documentation/comments updated as needed. 