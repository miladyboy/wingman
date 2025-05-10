import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage the active conversation ID, including localStorage sync and restoration.
 *
 * @param {Array} conversations - List of user conversations.
 * @param {object|null} session - The current user session.
 * @returns {{
 *   activeConversationId: string|null,
 *   setActiveConversationId: function
 * }}
 */
export default function useActiveConversationId(conversations, session) {
  const [activeConversationId, setActiveConversationIdState] = useState(null);

  /**
   * Persist the active conversation ID to localStorage and update state.
   * Only write to localStorage if the value changes.
   * @param {string|null} conversationId
   */
  const setActiveConversationId = useCallback((conversationId) => {
    setActiveConversationIdState(prev => {
      if (prev === conversationId) return prev;
      if (conversationId) {
        localStorage.setItem('harem:lastActiveChatId', conversationId);
      } else {
        localStorage.removeItem('harem:lastActiveChatId');
      }
      return conversationId;
    });
  }, []);

  // Restore last active chat or set default when conversations load
  useEffect(() => {
    if (!session) return;
    if (!Array.isArray(conversations) || conversations.length === 0) return;
    if (activeConversationId !== null) return;
    const lastActiveId = localStorage.getItem('harem:lastActiveChatId');
    if (lastActiveId && conversations.some(c => c.id === lastActiveId)) {
      setActiveConversationId(lastActiveId);
    } else if (conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    } else {
      setActiveConversationId('new');
    }
  }, [conversations, session, activeConversationId, setActiveConversationId]);

  return { activeConversationId, setActiveConversationId };
} 