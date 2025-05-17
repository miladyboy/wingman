import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useActiveConversationId(conversations, session, options = {}) {
  const { storageKey = 'harem:lastActiveChatId' } = options;
  const [activeConversationId, setActiveConversationIdState] = useState(null);

  const setActiveConversationId = useCallback(async (conversationId) => {
    setActiveConversationIdState(prev => {
      if (prev === conversationId) return prev;
      if (conversationId) {
        AsyncStorage.setItem(storageKey, conversationId);
      } else {
        AsyncStorage.removeItem(storageKey);
      }
      return conversationId;
    });
  }, [storageKey]);

  useEffect(() => {
    if (!session || !Array.isArray(conversations) || conversations.length === 0 || activeConversationId !== null) return;
    AsyncStorage.getItem(storageKey).then(lastActiveId => {
      if (lastActiveId && conversations.some(c => c.id === lastActiveId)) {
        setActiveConversationId(lastActiveId);
      } else {
        setActiveConversationId(conversations[0].id);
      }
    });
  }, [conversations, session, activeConversationId, setActiveConversationId, storageKey]);

  return { activeConversationId, setActiveConversationId };
}
