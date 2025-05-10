import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient'; // Assuming supabaseClient.js is in ../

/**
 * @typedef {import('@supabase/supabase-js').Session} Session
 * @typedef {import('@supabase/supabase-js').User} User
 */

/**
 * @typedef {object} Conversation
 * @property {string} id
 * @property {string} title
 * @property {string} created_at
 * @property {string} last_message_at
 */

/**
 * @typedef {object} Message
 * @property {string} id
 * @property {string} sender - 'user' or 'ai'
 * @property {string} content
 * @property {string} [image_description]
 * @property {string} created_at
 * @property {string[]} [imageUrls]
 * @property {boolean} [optimistic]
 * @property {boolean} [failed]
 * @property {object[]} [ChatMessageImages] - Raw from Supabase query
 */

/**
 * Manages all chat-related state and operations including conversations and messages.
 *
 * @param {Session | null} session - The current user session.
 * @returns {object} Chat state and action handlers.
 */
export function useChatState(session) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationIdState] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendMessageError, setSendMessageError] = useState(null);

  const [operationLoading, setOperationLoading] = useState(false); // For rename/delete
  const [operationError, setOperationError] = useState(null); // For rename/delete

  const user = session?.user;

  // --- Active Conversation ID Management ---
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

  // --- Fetch Conversations ---
  const fetchConversations = useCallback(async (currentUser) => {
    if (!currentUser) {
      setConversations([]);
      return;
    }
    setLoadingConversations(true);
    setConversationsError(null);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, created_at, last_message_at')
        .eq('user_id', currentUser.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversationsError('Could not fetch conversations.');
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations(user);
    } else {
      setConversations([]);
      setActiveConversationId(null);
      setMessages([]);
      // Clear errors when user logs out
      setConversationsError(null);
      setMessagesError(null);
      setSendMessageError(null);
      setOperationError(null);
    }
  }, [user, fetchConversations, setActiveConversationId]);

  // --- Restore last active chat or set default when conversations load ---
  useEffect(() => {
    if (!user) return; // Only run if user is logged in

    // If conversations are not yet loaded or empty
    if (!Array.isArray(conversations) || conversations.length === 0) {
      // If activeId is still initial null, and we have no convos (yet), prepare for a 'new' chat.
      // This avoids an intermediate state where activeId is null while convos might be loading.
      if (activeConversationId === null) {
        setActiveConversationId('new');
      }
      return; // Wait for conversations to load
    }

    // Conversations are loaded at this point.
    // Only proceed if activeConversationId is currently null (initial load) or 'new' (meaning no specific chat is active yet).
    // If it's already a specific ID, it might have been set by user interaction, so don't override on page load restoration.
    if (activeConversationId !== null && activeConversationId !== 'new') {
      return;
    }

    const lastActiveId = localStorage.getItem('harem:lastActiveChatId');

    if (lastActiveId && conversations.some(c => c.id === lastActiveId)) {
      // Restore from localStorage if valid and found in current conversations
      setActiveConversationId(lastActiveId);
    } else if (conversations.length > 0) {
      // Default to the first (most recent) conversation if localStorage is invalid or not found
      setActiveConversationId(conversations[0].id);
    } else {
      // This case should ideally be covered by the first block, but as a fallback.
      setActiveConversationId('new');
    }
  }, [conversations, user, activeConversationId, setActiveConversationId]);

  // --- Helper to reconcile optimistic and server messages ---
  function reconcileMessages(serverMessages, optimisticMessages) {
    const filteredOptimistic = optimisticMessages.filter(optMsg => {
      if (!optMsg.optimistic) return false;
      return !serverMessages.some(
        srvMsg =>
          srvMsg.sender === optMsg.sender &&
          srvMsg.content === optMsg.content &&
          Array.isArray(srvMsg.imageUrls) &&
          Array.isArray(optMsg.imageUrls) &&
          srvMsg.imageUrls.length === optMsg.imageUrls.length
      );
    });
    return [...serverMessages, ...filteredOptimistic];
  }

  // --- Fetch Messages ---
  const fetchMessages = useCallback(async () => {
    if (!activeConversationId || !user || activeConversationId === 'new') {
      setMessages([]);
      setMessagesError(null);
      return;
    }
    setLoadingMessages(true);
    setMessagesError(null);
    try {
      // Verify conversation ownership and existence before fetching messages
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', activeConversationId)
        .eq('user_id', user.id)
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

      // Dynamically import supabaseUrl only when needed, or consider passing as prop / context
      const { supabaseUrl } = await import('../supabaseClient');
      const bucketUrl = `${supabaseUrl}/storage/v1/object/public/chat-images/`;

      const serverMessages = (data || []).map(msg => ({
        ...msg,
        imageUrls: (msg.ChatMessageImages || []).map(img => bucketUrl + img.storage_path),
      }));

      setMessages(prevMessages => {
        const optimisticMessages = prevMessages.filter(m => m.optimistic);
        return reconcileMessages(serverMessages, optimisticMessages);
      });

    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessagesError(`Could not fetch messages. ${err.message}`);
      setMessages([]); // Clear messages on error
    } finally {
      setLoadingMessages(false);
    }
  }, [activeConversationId, user]); // Removed fetchConversations from deps, not directly used here

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]); // Automatically re-fetches when activeConversationId or user changes (due to fetchMessages deps)

  // --- Handle New Thread ---
  const handleNewThread = useCallback(() => {
    setActiveConversationId('new');
    setMessages([]);
    setMessagesError(null); // Clear any previous message errors
    setSendMessageError(null); // Clear send message errors too
  }, [setActiveConversationId]);

  // --- Handle Send Message ---
  const handleSendMessage = useCallback(async (formData) => {
    if (!user) {
      setSendMessageError('User session not found. Please log in.');
      return;
    }

    let currentConversationId = activeConversationId;
    setSendingMessage(true);
    setSendMessageError(null);

    // Create new conversation if starting a new thread
    if (currentConversationId === 'new') {
      try {
        const initialTitle = `New Chat ${conversations.length + 1}`;
        const { data: newConvData, error: newConvError } = await supabase
          .from('conversations')
          .insert({ user_id: user.id, title: initialTitle })
          .select()
          .single();

        if (newConvError) throw newConvError;
        if (!newConvData) throw new Error('Failed to create conversation: No data returned.');

        setConversations(prev => [newConvData, ...prev]);
        setActiveConversationId(newConvData.id);
        currentConversationId = newConvData.id;
      } catch (err) {
        setSendMessageError(`Could not start a new conversation: ${err.message}`);
        setSendingMessage(false);
        return;
      }
    }

    if (!currentConversationId) { // Should not happen if 'new' case is handled
      setSendMessageError('No active conversation. Please select or start one.');
      setSendingMessage(false);
      return;
    }

    formData.append('conversationId', currentConversationId);

    // Optimistic UI update for user message
    const optimisticId = `user-${Date.now()}`;
    const optimisticImageUrls = [];
    const imageFiles = formData.getAll('images');
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file instanceof File) {
          optimisticImageUrls.push(URL.createObjectURL(file));
        }
      }
    }
    const optimisticUserMessage = {
      id: optimisticId,
      sender: 'user',
      content: formData.get('newMessageText'),
      imageUrls: optimisticImageUrls,
      optimistic: true,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticUserMessage]);

    const historyJson = JSON.stringify(
      messages // Use current messages state for history
        .filter(m => !m.optimistic) // Exclude optimistic messages from history sent to backend
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.image_description ? `${m.content || ''}\n[Image Description: ${m.image_description}]` : m.content,
        }))
    );
    formData.append('historyJson', historyJson);

    // Backend call in a timeout to allow UI to update
    setTimeout(async () => {
      let assistantMessageId = `ai-${Date.now()}`;
      let assistantMessageContent = '';
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/analyze`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown backend error' }));
          throw new Error(errorData.details || errorData.error || `Backend Error: ${response.statusText}`);
        }

        // Streaming response handling
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let buffer = '';

        setMessages(prev => [
          ...prev.map(m => m.id === optimisticId ? { ...m, optimistic: false } : m), // Mark user message as non-optimistic
          { id: assistantMessageId, sender: 'ai', content: '', imageUrls: [], created_at: new Date().toISOString() },
        ]);

        // Optimistically move the active conversation to the top
        setConversations(prevConversations => {
          const now = new Date().toISOString();
          const idx = prevConversations.findIndex(c => c.id === currentConversationId);
          if (idx === -1) return prevConversations; // Should not happen
          const updatedConv = { ...prevConversations[idx], last_message_at: now };
          return [
            updatedConv,
            ...prevConversations.slice(0, idx),
            ...prevConversations.slice(idx + 1)
          ];
        });

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          buffer += value ? decoder.decode(value, { stream: true }) : '';
          let eolIndex;
          while ((eolIndex = buffer.indexOf('\n\n')) !== -1) {
            const raw = buffer.slice(0, eolIndex).trim();
            buffer = buffer.slice(eolIndex + 2);
            if (raw.startsWith('data:')) {
              try {
                const event = JSON.parse(raw.replace(/^data:/, '').trim());
                if (event.text !== undefined && !event.done) {
                  assistantMessageContent += event.text;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: assistantMessageContent }
                        : msg
                    )
                  );
                }
                if (event.done) break; // Exit inner loop if stream indicates completion
              } catch (parseError) {
                console.warn('Failed to parse stream event:', parseError, raw);
                // Decide if to break or continue based on error type
                break; // Safest to break on parse error
              }
            }
          }
        }
        // Final update for assistant message content if anything remains in assistantMessageContent
        // This also ensures that if the stream ends without event.done, the content is set.
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantMessageContent } 
              : msg
          )
        );

        // After successful stream, re-fetch messages to get the persisted AI message with proper ID and timestamps
        // This also helps reconcile any ChatMessageImages if the AI response included image generation/reference
        await fetchMessages(); 

      } catch (err) {
        setSendMessageError(`Backend communication error: ${err.message}.`);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === optimisticId ? { ...msg, failed: true, optimistic: false } : msg
          )
        );
      } finally {
        optimisticImageUrls.forEach(url => URL.revokeObjectURL(url));
        setSendingMessage(false);
        // Do not refetch all messages here, as the stream should provide the final AI message.
        // If full reconciliation is needed, it can be triggered separately or after stream completion.
      }
    }, 0);
  }, [activeConversationId, session, messages, conversations, setActiveConversationId, fetchMessages]); // Added fetchMessages

  // --- Handle Rename Thread ---
  const handleRenameThread = useCallback(async (conversationIdToRename, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName || !user) return;

    const originalConversations = [...conversations];
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationIdToRename ? { ...conv, title: trimmedName } : conv
      )
    );
    setOperationLoading(true);
    setOperationError(null);
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: trimmedName })
        .eq('id', conversationIdToRename)
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (err) {
      console.error('Error renaming conversation:', err);
      setOperationError(`Failed to rename conversation: ${err.message}`);
      setConversations(originalConversations); // Revert on error
    } finally {
      setOperationLoading(false);
    }
  }, [user, conversations]);

  // --- Handle Delete Conversation ---
  const handleDeleteConversation = useCallback(async (conversationIdToDelete) => {
    if (!user) return;
    // No window.confirm here, AppRouter should handle it if needed, or the component calling this.
    // Caller should confirm before invoking this destructive action.

    setOperationLoading(true);
    setOperationError(null);
    try {
      // 1. Fetch all messages for the conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationIdToDelete);
      if (messagesError) throw messagesError;
      const messageIds = (messagesData || []).map(m => m.id);

      // 2. Fetch all image records for those messages
      let imageRecords = [];
      if (messageIds.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from('ChatMessageImages')
          .select('id, storage_path')
          .in('message_id', messageIds);
        if (imagesError) throw imagesError;
        imageRecords = imagesData || [];
      }

      // 3. Delete images from Supabase Storage
      const imagePathsToDelete = imageRecords.map(img => img.storage_path).filter(Boolean);
      if (imagePathsToDelete.length > 0) {
         const { error: storageError } = await supabase.storage.from('chat-images').remove(imagePathsToDelete);
         if (storageError) console.warn('Some images might not have been deleted from storage:', storageError);
      }
      
      // Transactions are not simple with Supabase SDK for multi-step like this.
      // Proceed with individual deletions. RLS should protect data.

      // 4. Delete image records from ChatMessageImages (CASCADE on message delete might handle this, but explicit is safer)
      if (imageRecords.length > 0) { // Check if there are image records to delete
        const imageRecordIds = imageRecords.map(img => img.id);
        await supabase.from('ChatMessageImages').delete().in('id', imageRecordIds);
      }

      // 5. Delete messages (CASCADE on conversation delete might handle this)
      if (messageIds.length > 0) {
        await supabase.from('messages').delete().in('id', messageIds);
      }

      // 6. Delete the conversation itself
      const { error: convDeleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationIdToDelete)
        .eq('user_id', user.id);
      if (convDeleteError) throw convDeleteError;

      // 7. Update frontend state
      setConversations(prev => {
        const updated = prev.filter(c => c.id !== conversationIdToDelete);
        if (activeConversationId === conversationIdToDelete) {
          if (updated.length > 0) {
            setActiveConversationId(updated[0].id);
          } else {
            setActiveConversationId('new');
          }
          setMessages([]); // Clear messages for the deleted conversation
        }
        return updated;
      });

    } catch (err) {
      console.error('Error deleting conversation:', err);
      setOperationError('Failed to delete conversation: ' + (err.message || err));
      // Note: Not reverting local state on delete error, as partial deletion might have occurred.
      // A full refresh/refetch might be a good strategy here or let user retry.
    } finally {
      setOperationLoading(false);
    }
  }, [user, activeConversationId, setActiveConversationId]);

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    loadingConversations,
    conversationsError,
    messages,
    loadingMessages,
    messagesError,
    handleNewThread,
    handleSendMessage,
    sendingMessage,
    sendMessageError,
    handleRenameThread,
    handleDeleteConversation,
    operationLoading, // Generic loading for rename/delete
    operationError,   // Generic error for rename/delete
    fetchConversations, // Expose if manual refetch is needed
    fetchMessages,      // Expose if manual refetch is needed
  };
} 