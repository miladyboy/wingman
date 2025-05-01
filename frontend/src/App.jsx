import React, { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import LandingPage from './components/LandingPage'
import MainApp from './components/MainApp'
import './index.css'

function RequireAuth({ session, children }) {
  const location = useLocation();
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}

function RedirectIfAuth({ session, children }) {
  const location = useLocation();
  if (session) {
    return <Navigate to="/app" state={{ from: location }} replace />;
  }
  return children;
}

function AppRouter() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user)
        fetchConversations(session.user)
      } else {
        setProfile(null)
        setConversations([])
        setActiveConversationId(null)
        setMessages([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = useCallback(async (user) => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, email`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setProfile(data)
      } else {
        console.log("Profile not found yet, trigger should create it.")
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Could not fetch user profile.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchConversations = useCallback(async (user) => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      setConversations(data || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setError('Could not fetch conversations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchConversations(session.user)
    }
  }, [session, fetchConversations])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversationId || !session || activeConversationId === 'new') {
        setMessages([]);
        setError(null);
        return;
      }

      setLoadingMessages(true)
      setError(null)
      try {
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('id', activeConversationId)
          .eq('user_id', session.user.id)
          .single()

        if (convError || !convData) {
          throw new Error("Conversation not found or access denied.")
        }

        const { data, error } = await supabase
          .from('messages')
          .select(`id, sender, content, image_description, created_at, ChatMessageImages(storage_path)`)
          .eq('conversation_id', activeConversationId)
          .order('created_at', { ascending: true })

        if (error) throw error

        const { supabaseUrl } = await import('./supabaseClient');
        const bucketUrl = `${supabaseUrl}/storage/v1/object/public/chat-images/`;

        const messagesWithImages = (data || []).map(msg => ({
          ...msg,
          imageUrls: (msg.ChatMessageImages || []).map(img => bucketUrl + img.storage_path)
        }));

        setMessages(messagesWithImages)
      } catch (error) {
        console.error('Error fetching messages:', error)
        setError(`Could not fetch messages for this conversation. ${error.message}`)
        setMessages([])
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [activeConversationId, session])

  const handleNewThread = () => {
    setActiveConversationId('new');
    setMessages([]);
    setError(null);
  }

  const handleSendMessage = useCallback(async (formData) => {
    let currentConversationId = activeConversationId;
    if (currentConversationId === 'new') {
      setLoading(true);
      setError(null);
      try {
        const initialTitle = `New Chat ${conversations.length + 1}`;
        const { data, error } = await supabase
          .from('conversations')
          .insert({ user_id: session.user.id, title: initialTitle })
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setConversations(prevConversations => [data, ...prevConversations]);
          setActiveConversationId(data.id);
          currentConversationId = data.id;
        } else {
          throw new Error("Failed to create conversation: No data returned.");
        }
      } catch (error) {
        setError(`Could not start a new conversation: ${error.message}`);
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }
    formData.append('conversationId', currentConversationId);
    if (!currentConversationId || !session) {
      setError("Please select or start a conversation first.");
      return;
    }

    // Optimistically add the user message to the UI immediately
    const optimisticId = `user-${Date.now()}`;
    const optimisticImageUrls = [];
    if (formData.getAll('images').length > 0) {
      // Create object URLs for previews
      for (const file of formData.getAll('images')) {
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
    };
    setMessages(prevMessages => [...prevMessages, optimisticUserMessage]);

    const historyJson = JSON.stringify(messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.image_description ? `${m.content || ''}\n[Image Description: ${m.image_description}]` : m.content
    })));
    formData.append('historyJson', historyJson);

    setLoading(true);
    setError(null);

    let assistantMessageId = `ai-${Date.now()}`;
    let assistantMessageContent = '';
    let streamingError = null;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown backend error' }));
        throw new Error(errorData.details || errorData.error || `Backend Error: ${response.statusText}`);
      }
      // Streaming logic
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';
      // Add a placeholder for the assistant message
      setMessages(prevMessages => [
        ...prevMessages,
        { id: assistantMessageId, sender: 'ai', content: '', imageUrls: [] }
      ]);
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
                  setMessages(prevMessages => prevMessages.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantMessageContent }
                      : msg
                  ));
                }
              }
              if (event.done) {
                // Optionally, handle any finalization here
                break;
              }
            } catch (err) {
              streamingError = err;
              break;
            }
          }
        }
      }
      // Finalize the assistant message
      setMessages(prevMessages => prevMessages.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, content: assistantMessageContent }
          : msg
      ));
      // Remove the optimistic flag from the user message (or replace with real message if backend returns it)
      setMessages(prevMessages => prevMessages.map(msg =>
        msg.id === optimisticId ? { ...msg, optimistic: false } : msg
      ));
      // Clean up object URLs
      optimisticImageUrls.forEach(url => URL.revokeObjectURL(url));
    } catch (error) {
      setError(`Backend communication error: ${error.message}.`);
      streamingError = error;
      // Mark the optimistic message as failed
      setMessages(prevMessages => prevMessages.map(msg =>
        msg.id === optimisticId ? { ...msg, failed: true } : msg
      ));
      // Clean up object URLs
      optimisticImageUrls.forEach(url => URL.revokeObjectURL(url));
    } finally {
      setLoading(false);
    }
  }, [activeConversationId, session, messages]);

  const handleRenameThread = useCallback(async (conversationId, newName) => {
    const trimmedName = newName.trim()
    if (!trimmedName || !session) return

    const originalConversations = [...conversations]
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, title: trimmedName } : conv
      )
    )

    setError(null)
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: trimmedName })
        .eq('id', conversationId)
        .eq('user_id', session.user.id)

      if (error) throw error
    } catch (error) {
      console.error("Error renaming conversation:", error)
      setError(`Failed to rename conversation: ${error.message}`)
      setConversations(originalConversations)
    }
  }, [session, conversations])

  // Delete a conversation and all related data (images, messages, conversation)
  const handleDeleteConversation = useCallback(async (conversationId) => {
    if (!window.confirm('Are you sure you want to delete this conversation and all its messages and images? This cannot be undone.')) return;
    setLoading(true);
    setError(null);
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
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  }, [activeConversationId]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <RedirectIfAuth session={session}>
            <LandingPage onRequestAccess={() => window.location.href = '/auth'} />
          </RedirectIfAuth>
        } />
        <Route path="/auth" element={
          <RedirectIfAuth session={session}>
            <Auth />
          </RedirectIfAuth>
        } />
        <Route path="/app" element={
          <RequireAuth session={session}>
            <MainApp
              profile={profile}
              conversations={conversations}
              activeConversationId={activeConversationId}
              setActiveConversationId={setActiveConversationId}
              handleNewThread={handleNewThread}
              handleRenameThread={handleRenameThread}
              handleDeleteConversation={handleDeleteConversation}
              messages={messages}
              loading={loading}
              loadingMessages={loadingMessages}
              error={error}
              handleSendMessage={handleSendMessage}
              supabase={supabase}
            />
          </RequireAuth>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
