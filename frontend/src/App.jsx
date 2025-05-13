import { useEffect, useCallback, useState, useRef } from 'react'
import { supabase } from './services/supabaseClient'
import AppRoutes from './components/AppRoutes';
import { useAuthSession } from './hooks/useAuthSession';
import { useUserProfile } from './hooks/useUserProfile';
import useConversations from './hooks/useConversations';
import useMessages from './hooks/useMessages';
import useActiveConversationId from './hooks/useActiveConversationId';
import { buildOptimisticUserMessage, serializeMessageHistory, extractImageUrlsFromFiles } from './utils/messageUtils';
import { createConversation, sendMessageToBackend } from './services/messageService';

function AppRouter() {
  const { session, loading: authLoading, error: authError } = useAuthSession();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(session?.user?.id);
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    fetchConversations,
    setConversations
  } = useConversations(supabase, session);
  const { activeConversationId, setActiveConversationId } = useActiveConversationId(conversations, session);
  const {
    messages,
    loadingMessages,
    error: messagesError,
    fetchMessages,
    setMessages
  } = useMessages(supabase, session, activeConversationId);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const optimisticIdRef = useRef(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchConversations(session.user)
      } else {
        setConversations([])
        setActiveConversationId(null)
        setMessages([])
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchConversations, setActiveConversationId])

  const handleNewThread = () => {
    setActiveConversationId('new');
    setMessages([]);
  };

  const handleSendMessage = useCallback((formData) => {
    setPendingFormData(formData);
    setSendingMessage(true);
  }, []);

  useEffect(() => {
    if (!sendingMessage || !pendingFormData) return;
    (async () => {
      let currentConversationId = activeConversationId;
      let newConversationData = null;
      const formData = pendingFormData;
      if (currentConversationId === 'new') {
        try {
          const initialTitle = `New Chat ${conversations.length + 1}`;
          newConversationData = await createConversation(supabase, session.user.id, initialTitle);
          setConversations(prevConversations => [newConversationData, ...prevConversations]);
          setActiveConversationId(newConversationData.id);
          currentConversationId = newConversationData.id;
        } catch (error) {
          console.error('Error starting new conversation:', error);
          setSendingMessage(false);
          setPendingFormData(null);
          return;
        }
      }
      formData.append('conversationId', currentConversationId);
      if (!currentConversationId || !session) {
        console.error('Please select or start a conversation first.');
        setSendingMessage(false);
        setPendingFormData(null);
        return;
      }
      // Optimistically add the user message to the UI immediately (only once)
      const optimisticImageUrls = extractImageUrlsFromFiles(formData);
      const optimisticUserMessage = buildOptimisticUserMessage(formData, optimisticImageUrls);
      optimisticIdRef.current = optimisticUserMessage.id;
      setMessages(prevMessages => {
        // Remove any previous optimistic message with the same id (shouldn't happen, but safe)
        const filtered = prevMessages.filter(msg => msg.id !== optimisticUserMessage.id);
        return [...filtered, optimisticUserMessage];
      });
      const historyJson = serializeMessageHistory(messages);
      formData.append('historyJson', historyJson);
      // Start backend call
      let assistantMessageId = `ai-${Date.now()}`;
      let assistantMessageContent = '';
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const response = await sendMessageToBackend(backendUrl, session.access_token, formData);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown backend error' }));
          throw new Error(errorData.details || errorData.error || `Backend Error: ${response.statusText}`);
        }
        // Streaming logic
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let buffer = '';
        setMessages(prevMessages => [
          ...prevMessages,
          { id: assistantMessageId, sender: 'ai', content: '', imageUrls: [] },
        ]);
        // --- Optimistically move the active conversation to the top ---
        setConversations(prevConversations => {
          const now = new Date().toISOString();
          const idx = prevConversations.findIndex(c => c.id === currentConversationId);
          if (idx === -1) return prevConversations;
          const updated = [
            { ...prevConversations[idx], last_message_at: now },
            ...prevConversations.slice(0, idx),
            ...prevConversations.slice(idx + 1)
          ];
          return updated;
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
                if (event.text !== undefined) {
                  if (!event.done) {
                    assistantMessageContent += event.text;
                    setMessages(prevMessages =>
                      prevMessages.map(msg =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: assistantMessageContent }
                          : msg
                      )
                    );
                  }
                }
                if (event.done) {
                  break;
                }
              } catch {
                break;
              }
            }
          }
        }
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantMessageContent }
              : msg
          )
        );
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === optimisticIdRef.current ? { ...msg, optimistic: false } : msg
          )
        );
        optimisticImageUrls.forEach(url => URL.revokeObjectURL(url));
        setSendingMessage(false);
        setPendingFormData(null);
      } catch (error) {
        console.error('Backend communication error:', error);
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === optimisticIdRef.current ? { ...msg, failed: true } : msg
          )
        );
        optimisticImageUrls.forEach(url => URL.revokeObjectURL(url));
        setSendingMessage(false);
        setPendingFormData(null);
      }
    })();
  }, [sendingMessage, pendingFormData]);

  const handleRenameThread = useCallback(async (conversationId, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName || !session) return;
    const originalConversations = [...conversations];
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, title: trimmedName } : conv
      )
    );
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: trimmedName })
        .eq('id', conversationId)
        .eq('user_id', session.user.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error renaming conversation:', error);
      setConversations(originalConversations);
    }
  }, [session, conversations]);

  // Delete a conversation and all related data (images, messages, conversation)
  const handleDeleteConversation = useCallback(async (conversationId) => {
    if (!window.confirm('Are you sure you want to delete this conversation and all its messages and images? This cannot be undone.')) return;
    try {
      // 1. Fetch all messages for the conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId);
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
      for (const img of imageRecords) {
        if (img.storage_path) {
          await supabase.storage.from('chat-images').remove([img.storage_path]);
        }
      }

      // 4. Delete image records from ChatMessageImages (CASCADE on message delete, but safe to do)
      if (messageIds.length > 0 && imageRecords.length > 0) {
        await supabase.from('ChatMessageImages').delete().in('message_id', messageIds);
      }

      // 5. Delete messages
      if (messageIds.length > 0) {
        await supabase.from('messages').delete().in('id', messageIds);
      }

      // 6. Delete the conversation
      await supabase.from('conversations').delete().eq('id', conversationId);

      // 7. Update frontend state
      setConversations(prev => {
        const updated = prev.filter(c => c.id !== conversationId);
        if (activeConversationId === conversationId) {
          if (updated.length > 0) {
            setActiveConversationId(updated[0].id);
          } else {
            setActiveConversationId('new');
          }
          setMessages([]);
        }
        return updated;
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [activeConversationId, setActiveConversationId]);

  return (
    <AppRoutes
      session={session}
      profile={profile}
      conversations={conversations}
      activeConversationId={activeConversationId}
      setActiveConversationId={setActiveConversationId}
      handleNewThread={handleNewThread}
      handleRenameThread={handleRenameThread}
      handleDeleteConversation={handleDeleteConversation}
      messages={messages}
      loading={authLoading}
      loadingMessages={loadingMessages}
      error={authError || conversationsError || messagesError}
      handleSendMessage={handleSendMessage}
      sendingMessage={sendingMessage}
      supabase={supabase}
    />
  );
}

export default function App() {
  return (
      <AppRouter />
  );
}
