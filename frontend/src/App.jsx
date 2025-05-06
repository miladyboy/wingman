import React, { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import LandingPage from './components/LandingPage'
import MainApp from './components/MainApp'
import './index.css'
import { Button } from './components/ui/button';

function RequireAuth({ session, children }) {
  const location = useLocation();
  if (!session) {
    return <Navigate to="/" state={{ from: location }} replace />;
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

function RequireSubscription({ children }) {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    async function check() {
      try {
        // Get the current session and access token
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        const res = await fetch('/api/payments/subscription-status', {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const data = await res.json();
        if (data.active) {
          setActive(true);
        } else {
          navigate('/subscribe');
        }
      } catch {
        navigate('/subscribe');
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [navigate]);
  if (loading) return null;
  if (!active) return null;
  return children;
}

function AppRouter() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationIdState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const navigate = useNavigate();

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

  // Move fetchProfile and fetchConversations above useEffect
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
        .select('id, title, created_at, last_message_at')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })

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
  }, [fetchProfile, fetchConversations, setActiveConversationId])

  // --- Restore last active chat or set default when conversations load ---
  useEffect(() => {
    // Only run restoration if conversations are loaded and activeConversationId is null
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

  useEffect(() => {
    if (session) {
      fetchConversations(session.user);
    }
  }, [session, fetchConversations]);

  // Helper to reconcile optimistic and server messages
  function reconcileMessages(serverMessages, optimisticMessages) {
    // Remove optimistic messages that have a matching real message (by content and image count)
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

  useEffect(() => {
    const fetchMessages = async () => {
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
        const { supabaseUrl } = await import('./supabaseClient');
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
        console.error('Error fetching messages:', error);
        setError(`Could not fetch messages for this conversation. ${error.message}`);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeConversationId, session, fetchConversations]);

  const handleNewThread = () => {
    setActiveConversationId('new');
    setMessages([]);
    setError(null);
  };

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
          throw new Error('Failed to create conversation: No data returned.');
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
      setError('Please select or start a conversation first.');
      return;
    }
    // Optimistically add the user message to the UI immediately
    const optimisticId = `user-${Date.now()}`;
    const optimisticImageUrls = [];
    if (formData.getAll('images').length > 0) {
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
      content: m.image_description ? `${m.content || ''}\n[Image Description: ${m.image_description}]` : m.content,
    })));
    formData.append('historyJson', historyJson);
    setLoading(true);
    setError(null);
    let assistantMessageId = `ai-${Date.now()}`;
    let assistantMessageContent = '';
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
          msg.id === optimisticId ? { ...msg, optimistic: false } : msg
        )
      );
      optimisticImageUrls.forEach(url => URL.revokeObjectURL(url));
    } catch (error) {
      setError(`Backend communication error: ${error.message}.`);
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === optimisticId ? { ...msg, failed: true } : msg
        )
      );
      optimisticImageUrls.forEach(url => URL.revokeObjectURL(url));
    } finally {
      setLoading(false);
    }
  }, [activeConversationId, session, messages, conversations.length, setActiveConversationId]);

  const handleRenameThread = useCallback(async (conversationId, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName || !session) return;
    const originalConversations = [...conversations];
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, title: trimmedName } : conv
      )
    );
    setError(null);
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: trimmedName })
        .eq('id', conversationId)
        .eq('user_id', session.user.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error renaming conversation:', error);
      setError(`Failed to rename conversation: ${error.message}`);
      setConversations(originalConversations);
    }
  }, [session, conversations]);

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
      setError('Failed to delete conversation: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  }, [activeConversationId, setActiveConversationId]);

  // Move Subscribe component here so it can use navigate
  function Subscribe() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate('/');
    };
    const handleSubscribe = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('You must be logged in.');
          setLoading(false);
          navigate('/');
          return;
        }
        const res = await fetch('/api/payments/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to create checkout session');
        }
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
        } else {
          throw new Error('No checkout URL returned.');
        }
      } catch (e) {
        setError(e.message || 'An error occurred.');
        setLoading(false);
      }
    };
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Subscribe to Harem</h2>
        <p className="mb-6">To access the app, please subscribe.</p>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <Button size="lg" className="bg-royal text-ivory font-bold shadow-md hover:bg-royal/90" onClick={handleSubscribe} disabled={loading}>
          {loading ? 'Redirecting...' : 'Subscribe'}
        </Button>
        <Button size="sm" variant="outline" className="mt-6" onClick={handleLogout} disabled={loading}>
          Log out
        </Button>
      </div>
    );
  }

  return (
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
      <Route path="/subscribe" element={<Subscribe />} />
      <Route path="/app" element={
        <RequireAuth session={session}>
          <RequireSubscription>
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
          </RequireSubscription>
        </RequireAuth>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
