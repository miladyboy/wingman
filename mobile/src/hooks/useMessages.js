import { useState, useEffect, useCallback } from 'react';

/**
 * Utility to reconcile optimistic and server messages.
 * Removes optimistic messages that have a matching real message (by content and image count or more).
 * If the server message is less complete (fewer images), keep the optimistic message and do not add the server message.
 */
function reconcileMessages(serverMessages, optimisticMessages) {
  // Filter out server messages that are less complete than optimistic ones
  const filteredServerMessages = serverMessages.filter(srvMsg => {
    // Find a matching optimistic message by sender and content
    const matchingOptMsg = optimisticMessages.find(optMsg =>
      optMsg.sender === srvMsg.sender &&
      optMsg.content === srvMsg.content &&
      Array.isArray(optMsg.imageUrls)
    );
    if (matchingOptMsg) {
      // If the server message has fewer images than the optimistic one, skip it
      if (
        Array.isArray(srvMsg.imageUrls) &&
        srvMsg.imageUrls.length < matchingOptMsg.imageUrls.length
      ) {
        return false; // Don't include this server message
      }
    }
    return true; // Include server message if no matching optimistic or not less complete
  });

  // Filter out optimistic messages that have a matching (same or more complete) server message
  const filteredOptimistic = optimisticMessages.filter(optMsg => {
    if (!optMsg.optimistic) return false;
    return !filteredServerMessages.some(
      srvMsg =>
        srvMsg.sender === optMsg.sender &&
        srvMsg.content === optMsg.content &&
        Array.isArray(srvMsg.imageUrls) &&
        srvMsg.imageUrls.length >= optMsg.imageUrls.length
    );
  });
  return [...filteredServerMessages, ...filteredOptimistic];
}

/**
 * Custom hook to manage messages state and fetching from Supabase.
 *
 * @param {object} supabase - The Supabase client instance.
 * @param {object|null} session - The current user session.
 * @param {string|null} activeConversationId - The currently active conversation ID.
 * @returns {{
 *   messages: Array,
 *   loadingMessages: boolean,
 *   error: string|null,
 *   fetchMessages: function,
 *   setMessages: function
 * }}
 */
export default function useMessages(supabase, session, activeConversationId) {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!activeConversationId || !session || activeConversationId === 'new') {
      setMessages([]);
      setError(null);
      return;
    }
    setLoadingMessages(true);
    setError(null);
    try {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', activeConversationId)
        .eq('user_id', session.user.id)
        .single();
      if (convError || !convData) {
        throw new Error('Conversation not found or access denied.');
      }
      const { data, error } = await supabase
        .from('messages')
        .select(`id, sender, content, image_description, created_at, ChatMessageImages(storage_path)`)
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const { supabaseUrl } = await import('../services/supabaseClient');
      const bucketUrl = `${supabaseUrl}/storage/v1/object/public/chat-images/`;
      const serverMessages = (data || []).map(msg => ({
        ...msg,
        imageUrls: (msg.ChatMessageImages || []).map(img => bucketUrl + img.storage_path),
      }));
      setMessages(prevMessages => {
        const optimisticMessages = prevMessages.filter(m => m.optimistic);
        return reconcileMessages(serverMessages, optimisticMessages);
      });
    } catch (error) {
      setError(`Could not fetch messages for this conversation. ${error.message}`);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeConversationId, session, supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loadingMessages, error, fetchMessages, setMessages };
}

export { reconcileMessages }; 
