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

  const handleSendMessage = useCallback(async (text, imageFile) => {
    if (!activeConversationId || !session) {
      setError("Please select or start a conversation first.")
      return
    }

    setLoading(true)
    setError(null)

    let imageBase64 = null
    let imageMimeType = null
    let imageDescriptionForUserMessage = null

    if (imageFile) {
      try {
        const reader = new FileReader()
        await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            imageBase64 = event.target.result.split(',')[1]
            imageMimeType = event.target.result.match(/:(.*?);/)[1]
            resolve()
          }
          reader.onerror = (error) => reject(error)
          reader.readAsDataURL(imageFile)
        })
      } catch (err) {
        console.error("Error reading image file:", err)
        setError("Failed to process the image. Please try again.")
        setLoading(false)
        return
      }
    }

    const userMessageContent = text || (imageFile ? '[Image Sent]' : '')
    const userMessageForDb = {
      conversation_id: activeConversationId,
      sender: 'user',
      content: userMessageContent,
    }

    const payload = {
      history: [],
      newMessage: {
        text: text || '',
        imageBase64: imageBase64,
        imageMimeType: imageMimeType
      },
    }
    console.log("Sending payload with text:", payload.newMessage.text)

    let backendResponseData = null
    try {
      const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown backend error' }))
        console.error('Backend failed:', errorData)
        throw new Error(errorData.details || errorData.error || `Backend Error: ${response.statusText}`)
      }
      backendResponseData = await response.json()

      if (!text && backendResponseData.imageDescription) {
        userMessageForDb.content = `[Image Analysis: ${backendResponseData.imageDescription}]`
        userMessageForDb.image_description = backendResponseData.imageDescription
      } else if (backendResponseData.imageDescription) {
        userMessageForDb.image_description = backendResponseData.imageDescription
      }

    } catch (error) {
      console.error('Error sending message to backend:', error)
      setError(`Backend communication error: ${error.message}.`)
      setLoading(false)
      return
    }

    try {
      const assistantMessageContent = backendResponseData.suggestions.join('\n\n---\n\n')
      const assistantMessageForDb = {
        conversation_id: activeConversationId,
        sender: 'ai',
        content: assistantMessageContent,
      }

      const { data: insertedMessages, error: insertError } = await supabase
        .from('messages')
        .insert([userMessageForDb, assistantMessageForDb])
        .select()

      if (insertError) throw insertError

      if (insertedMessages) {
        setMessages(prevMessages => [...prevMessages, ...insertedMessages])
      } else {
        console.warn("Messages inserted but not returned, might need manual refetch")
      }

      const firstMessage = messages.length === 0 && (!insertedMessages || insertedMessages.length === 0)
      if (firstMessage && backendResponseData.nickname) {
        const { error: updateError } = await supabase
          .from('conversations')
          .update({ title: backendResponseData.nickname, updated_at: new Date().toISOString() })
          .eq('id', activeConversationId)

        if (updateError) throw updateError

        setConversations(prev => prev.map(c =>
          c.id === activeConversationId ? { ...c, title: backendResponseData.nickname, updated_at: new Date().toISOString() } : c
        ))
      } else {
        const { error: updateTsError } = await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeConversationId)
        if (updateTsError) console.warn("Failed to explicitly update timestamp:", updateTsError)
        setConversations(prev => prev.map(c =>
          c.id === activeConversationId ? { ...c, updated_at: new Date().toISOString() } : c
        ))
      }
    } catch (error) {
      console.error('Error saving messages or updating conversation:', error)
      setError(`Failed to save message or update conversation: ${error.message}`)
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
