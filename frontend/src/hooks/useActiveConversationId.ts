import { useState, useCallback, useEffect } from 'react';

export interface Conversation {
  id: string;
  [key: string]: any;
}

export interface Session {
  user: { id: string };
  [key: string]: any;
}

export interface UseActiveConversationIdOptions {
  storageKey?: string;
  storage?: Storage;
}

/**
 * Custom hook to manage the active conversation ID, including storage sync and restoration.
 *
 * @param conversations - List of user conversations.
 * @param session - The current user session.
 * @param options - Optional storage and key injection for testability/SSR safety.
 * @returns {{
 *   activeConversationId: string | null,
 *   setActiveConversationId: (id: string | null) => void
 * }}
 */
export default function useActiveConversationId(
  conversations: Conversation[],
  session: Session | null,
  options: UseActiveConversationIdOptions = {}
) {
  const {
    storageKey = 'harem:lastActiveChatId',
    storage = typeof window !== 'undefined' ? window.localStorage : undefined,
  } = options;

  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);

  const setActiveConversationId = useCallback(
    (conversationId: string | null) => {
      setActiveConversationIdState(prev => {
        if (prev === conversationId) return prev;
        if (storage && conversationId) {
          storage.setItem(storageKey, conversationId);
        } else if (storage) {
          storage.removeItem(storageKey);
        }
        return conversationId;
      });
    },
    [storage, storageKey]
  );

  useEffect(() => {
    if (!session) return;
    if (!Array.isArray(conversations) || conversations.length === 0) return;
    if (activeConversationId !== null) return;
    const lastActiveId = storage?.getItem(storageKey);
    if (lastActiveId && conversations.some(c => c.id === lastActiveId)) {
      setActiveConversationId(lastActiveId);
    } else {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, session, activeConversationId, setActiveConversationId, storage, storageKey]);

  return { activeConversationId, setActiveConversationId };
} 