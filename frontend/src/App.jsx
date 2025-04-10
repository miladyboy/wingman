import React, { useState, useEffect, useCallback } from 'react'
import UploadComponent from './components/UploadComponent'
import ChatHistory from './components/ChatHistory'
import Sidebar from './components/Sidebar'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import './index.css'

function App() {
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
      if (!activeConversationId || !session) {
        setMessages([])
        return
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
          .select('id, sender, content, image_description, created_at')
          .eq('conversation_id', activeConversationId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages(data || [])
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

  const activeConversation = conversations.find(conv => conv.id === activeConversationId)

  const handleNewThread = async () => {
    if (!session) {
      setError("Please log in to start a new conversation.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const initialTitle = `New Chat ${conversations.length + 1}`
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: session.user.id, title: initialTitle })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setConversations(prevConversations => [data, ...prevConversations])
        setActiveConversationId(data.id)
      } else {
        throw new Error("Failed to create conversation: No data returned.")
      }
    } catch (error) {
      console.error("Error creating new conversation:", error)
      setError(`Could not start a new conversation: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = useCallback(async (formData) => {
    const currentConversationId = activeConversationId;
    formData.append('conversationId', currentConversationId);

    if (!currentConversationId || !session) {
      setError("Please select or start a conversation first.")
      return
    }

    console.log('[Frontend] handleSendMessage called with FormData:');
    for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
    }
    const historyJson = JSON.stringify(messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.image_description ? `${m.content || ''}\n[Image Description: ${m.image_description}]` : m.content
    })));
    formData.append('historyJson', historyJson);
    console.log('  historyJson:', historyJson);

    setLoading(true)
    setError(null)

    let backendResponseData = null
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      console.log(`[Frontend] Sending FormData request to backend URL: ${backendUrl}/analyze`);

      const response = await fetch(`${backendUrl}/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown backend error' }))
        console.error('[Frontend] Backend failed:', { status: response.status, data: errorData })
        throw new Error(errorData.details || errorData.error || `Backend Error: ${response.statusText}`)
      }
      backendResponseData = await response.json()
      console.log('[Frontend] Received response from backend:', backendResponseData);

      if (!backendResponseData || !backendResponseData.suggestions || !backendResponseData.savedMessage) {
         console.error("[Frontend] Invalid backend response structure:", backendResponseData);
         throw new Error("Received incomplete data from backend.");
      }

    } catch (error) {
      console.error('[Frontend] Error sending message to backend:', error)
      setError(`Backend communication error: ${error.message}.`)
      setLoading(false)
      return
    }

    try {
      const savedUserMessage = { ...backendResponseData.savedMessage };
      savedUserMessage.imageUrls = backendResponseData.imageUrls || [];

      const assistantMessageContent = backendResponseData.suggestions.join('\n\n---\n\n')
      const assistantMessageForDb = {
        conversation_id: savedUserMessage.conversation_id,
        sender: 'ai',
        content: assistantMessageContent,
      }

      console.log('[Frontend] Preparing to insert AI message into Supabase:', assistantMessageForDb);
      console.log('[Frontend] Adding user message (from backend response) and AI message to local state.');

      const { data: insertedAiMessages, error: insertError } = await supabase
        .from('messages')
        .insert([assistantMessageForDb])
        .select()

      if (insertError) throw insertError

      console.log('[Frontend] AI message inserted successfully:', insertedAiMessages);

      const messagesToAdd = [savedUserMessage];
      if (insertedAiMessages && insertedAiMessages.length > 0) {
          messagesToAdd.push(...insertedAiMessages);
      } else {
          console.warn("AI Message inserted but not returned, AI response might not show until refresh");
      }
      setMessages(prevMessages => [...prevMessages, ...messagesToAdd]);

      const firstMessage = messages.length === 0;
      if (firstMessage && backendResponseData.nickname) {
        console.log(`[Frontend] Updating conversation ${currentConversationId} title to: ${backendResponseData.nickname}`);
        const { error: updateError } = await supabase
          .from('conversations')
          .update({ title: backendResponseData.nickname, updated_at: new Date().toISOString() })
          .eq('id', currentConversationId)

        if (updateError) {
            console.error("[Frontend] Error updating conversation title:", updateError);
        } else {
            setConversations(prev => prev.map(c =>
              c.id === currentConversationId ? { ...c, title: backendResponseData.nickname, updated_at: new Date().toISOString() } : c
            ))
        }
      } else {
        console.log(`[Frontend] Updating conversation ${currentConversationId} timestamp.`);
        const { error: updateTsError } = await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentConversationId)
        if (updateTsError) {
            console.warn("[Frontend] Failed to explicitly update timestamp:", updateTsError);
        } else {
            setConversations(prev => prev.map(c =>
              c.id === currentConversationId ? { ...c, updated_at: new Date().toISOString() } : c
            ))
        }
      }
    } catch (error) {
      console.error('Error saving AI message or updating conversation:', error)
      setError(`Failed to save AI response or update conversation: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [activeConversationId, session, messages])

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

  if (!session) {
    return <Auth />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        threads={conversations.map(c => ({ id: c.id, name: c.title }))}
        activeThreadId={activeConversationId}
        onSelectThread={setActiveConversationId}
        onNewThread={handleNewThread}
        onRenameThread={handleRenameThread}
        user={profile}
        onLogout={() => supabase.auth.signOut()}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeConversation && (
          <div className="bg-white p-4 border-b border-gray-300 shadow-sm flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{activeConversation.title}</h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {activeConversationId ? (
            <ChatHistory history={messages.map(m => ({
              role: m.sender,
              content: m.content,
              imageDescription: m.image_description,
              imageUrls: m.imageUrls || [],
              timestamp: new Date(m.created_at).getTime()
            }))} />
          ) : (
            <div className="text-center text-gray-500 pt-10">
              Select a conversation or start a new one.
            </div>
          )}
          {loadingMessages && (
            <div className="text-center py-4 text-gray-600">Loading messages...</div>
          )}
          {loading && !loadingMessages && (
            <div className="text-center py-4 text-gray-600">Processing...</div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>

        {activeConversationId && (
          <div className="p-4 border-t border-gray-300 bg-white">
            <UploadComponent onSendMessage={handleSendMessage} disabled={loading} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
