import React, { useState, useEffect, useCallback } from 'react'
import UploadComponent from './components/UploadComponent'
import SuggestionsComponent from './components/SuggestionsComponent'
import ChatHistory from './components/ChatHistory'
import Sidebar from './components/Sidebar'
import { v4 as uuidv4 } from 'uuid'
import './index.css'

function App() {
  const [threads, setThreads] = useState([])
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // --- Load threads from localStorage on initial mount ---
  useEffect(() => {
    try {
      const savedThreads = localStorage.getItem('chatThreads')
      if (savedThreads) {
        const parsedThreads = JSON.parse(savedThreads)
        // Basic validation
        if (Array.isArray(parsedThreads)) {
          setThreads(parsedThreads)
          // Optionally, set the first thread as active if none is selected
          // if (!activeThreadId && parsedThreads.length > 0) {
          //   setActiveThreadId(parsedThreads[0].id)
          // }
        } else {
          console.warn("Invalid data found in localStorage for chatThreads. Resetting.")
          localStorage.removeItem('chatThreads')
        }
      }
    } catch (e) {
      console.error("Failed to load threads from localStorage:", e)
      // Handle potential parsing errors if data is corrupted
      localStorage.removeItem('chatThreads')
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  // --- Save threads to localStorage whenever they change ---
  useEffect(() => {
    try {
      localStorage.setItem('chatThreads', JSON.stringify(threads))
    } catch (e) {
      console.error("Failed to save threads to localStorage:", e)
      // Handle potential storage errors (e.g., quota exceeded)
      setError("Could not save chat history. Storage might be full.")
    }
  }, [threads]) // Dependency array includes threads

  // --- Get the currently active thread ---
  const activeThread = threads.find(thread => thread.id === activeThreadId)

  // --- Function to handle creating a new thread ---
  const handleNewThread = () => {
    const newThreadId = uuidv4()
    const newThread = {
      id: newThreadId,
      name: `New Chat ${threads.length + 1}`, // Temporary name
      history: [],
      createdAt: Date.now(),
    }
    setThreads(prevThreads => [newThread, ...prevThreads]) // Add to the beginning
    setActiveThreadId(newThreadId)
    setError(null) // Clear any previous errors
  }

  // --- Function to handle sending a message ---
  const handleSendMessage = useCallback(async (text, imageFile) => {
    if (!activeThreadId) {
      console.error("No active thread selected.")
      setError("Please select or start a conversation first.")
      return
    }

    setLoading(true)
    setError(null)

    let imageBase64 = null
    let imageMimeType = null

    // Read image file as base64 if present
    if (imageFile) {
      try {
        const reader = new FileReader()
        await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            // result contains the base64 string prefixed with data:mime/type;base64,
            imageBase64 = event.target.result.split(',')[1] // Get only the base64 part
            imageMimeType = event.target.result.match(/:(.*?);/)[1] // Extract MIME type
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

    const currentThread = threads.find(t => t.id === activeThreadId)
    if (!currentThread) {
      setError("Could not find the active thread.")
      setLoading(false)
      return
    }

    // Prepare payload for backend
    const payload = {
      history: currentThread.history.map(msg => ({ // Send only necessary parts
        role: msg.role,
        content: msg.content, // Backend expects 'content'
      })),
      newMessage: {
        text: text || '', // Send empty string instead of null
        imageBase64: imageBase64,
        imageMimeType: imageMimeType
      }
    }

    // Debug payload
    console.log("Sending payload with text:", payload.newMessage.text);

    try {
      const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()

        // Construct the user message for history
        const userMessage = {
          role: 'user',
          content: text || (data.imageDescription ? `[Image Analysis: ${data.imageDescription}]` : '[Image Sent]'), // Store description or placeholder
          imageDescription: data.imageDescription || undefined, // Store the generated description
          timestamp: Date.now(),
        }

        // Construct the assistant message for history
        const assistantMessage = {
          role: 'assistant',
          content: data.suggestions.join('\n\n---\n\n'), // Join suggestions for display
          timestamp: Date.now() + 1, // Ensure assistant message is after user message
        }

        setThreads(prevThreads =>
          prevThreads.map(thread => {
            if (thread.id === activeThreadId) {
              // Update thread name if it's the first message and a nickname was generated
              const newName = thread.history.length === 0 && data.nickname ? data.nickname : thread.name
              return {
                ...thread,
                name: newName,
                history: [...thread.history, userMessage, assistantMessage],
              }
            }
            return thread
          })
        )
      } else {
        const errorData = await response.json()
        console.error('Failed to get suggestions:', errorData)
        setError(errorData.details || errorData.error || 'Failed to get suggestions. Please try again.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError(`Network error: ${error.message}. Please check your connection and the backend server.`)
    } finally {
      setLoading(false)
    }
  }, [activeThreadId, threads]) // Dependencies for the callback

  // --- Function to rename a thread ---
  const handleRenameThread = useCallback((threadId, newName) => {
    setThreads(prevThreads =>
      prevThreads.map(thread =>
        thread.id === threadId ? { ...thread, name: newName.trim() || thread.name } : thread
      )
    )
  }, []) // No dependencies needed as it only uses its arguments and setThreads

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onNewThread={handleNewThread}
        onRenameThread={handleRenameThread} // Pass rename handler
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header (Optional: Could show thread name here) */}
        {activeThread && (
          <div className="bg-white p-4 border-b border-gray-300 shadow-sm flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{activeThread.name}</h2>
            {/* Add rename button/input here if desired */}
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {activeThread ? (
            <ChatHistory history={activeThread.history} />
          ) : (
            <div className="text-center text-gray-500 pt-10">
              Select a conversation or start a new one.
            </div>
          )}
          {loading && (
            <div className="text-center py-4 text-gray-600">Analyzing...</div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        {activeThreadId && ( // Only show input if a thread is active
          <div className="p-4 border-t border-gray-300 bg-white">
            {/* Pass handleSendMessage instead of onUpload */}
            <UploadComponent onSendMessage={handleSendMessage} disabled={loading} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
