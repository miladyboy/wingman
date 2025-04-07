import React, { useState } from 'react'
import UploadComponent from './components/UploadComponent'
import SuggestionsComponent from './components/SuggestionsComponent'
import './index.css'

function App() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpload = async (file, text) => {
    setLoading(true)
    setError(null)
    setSuggestions([])
    
    const formData = new FormData()
    
    // Add image file if present
    if (file) {
      formData.append('image', file)
    }
    
    // Add text if present
    if (text) {
      formData.append('text', text)
    }

    try {
      const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions)
      } else {
        const errorData = await response.json()
        console.error('Failed to get suggestions:', errorData)
        setError(errorData.error || 'Failed to get suggestions. Please try again.')
      }
    } catch (error) {
      console.error('Error uploading content:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
    
    return // Explicitly return a promise for finally handling
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Personal AI Wingman</h1>
        
        <div className="mb-8">
          <UploadComponent onUpload={handleUpload} />
        </div>
        
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-600">Analyzing your input...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {suggestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md">
            <SuggestionsComponent suggestions={suggestions} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
