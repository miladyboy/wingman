# Frontend Refactor Implementation Plan

This document outlines a step-by-step implementation plan to improve the structure, maintainability, and testability of the frontend code.

## Checklist

- [ ] Extract route guard components (`RequireAuth`, `RedirectIfAuth`, `RequireSubscription`) into individual files under `src/components/guards/`.
- [ ] Move `<Subscribe>` page into `src/pages/Subscribe.jsx` and router logic into `src/router/AppRouter.jsx`.
- [ ] Create an `AuthContext` provider in `src/context/AuthContext.jsx` to centralize authentication/session state and replace manual prop-passing.
- [ ] Refactor data-loading logic into custom hooks: `useProfile`, `useConversations`, `useMessages` in `src/hooks/`.
- [ ] Implement a `useChat` hook in `src/hooks/useChat.js` to encapsulate streaming & optimistic-UI messaging logic.
- [ ] Build a `useLocalStorage` hook in `src/hooks/useLocalStorage.js` to manage `harem:lastActiveChatId` restoration.
- [ ] Introduce React Query (or equivalent) for caching and automatic data refetch in hooks.
- [ ] Convert `.jsx` files to `.tsx` and define TypeScript interfaces for `Profile`, `Conversation`, and `Message`.
- [ ] Integrate a toast/snackbar system (e.g., `react-hot-toast`) for consistent error and success notifications.
- [ ] Replace `null` loading placeholders with skeleton loaders or spinners in key UI flows.
- [ ] Write unit tests (Jest + React Testing Library) for each new hook and extracted component.
- [ ] Add an E2E test script (`npm run test:e2e`) in `frontend/package.json` and verify Playwright setup.
- [ ] Run ESLint (`npm start -- --fix`) and remove any unused imports, variables, or dead code.
- [ ] Update `/frontend/.env.example` to include all required `VITE_` environment variables.
- [ ] (Optional) Explore using React Router v6 data APIs (loaders/redirects) to replace manual `<Navigate>` guards.

---

## Next Steps

Tackle each checklist item sequentially, open a dedicated PR per major grouping (e.g., context/hooks, TS migration), and include tests alongside the implementation. 