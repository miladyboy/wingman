import React, { useEffect, useRef } from 'react';
// SuggestionsComponent might not be needed anymore if AI response is plain text
// import SuggestionsComponent from './SuggestionsComponent';

// Updated props based on App.jsx
function ChatHistory({ history }) {
  const endOfMessagesRef = useRef(null);

  // Scroll to the bottom when history changes
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {/* Map over history using new structure */}
      {history.map((message, index) => {
        // Use 'sender' instead of 'role'
        const isUser = message.role === 'user'; // Keep using role for mapping

        return (
          <div key={message.id || index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`rounded-lg px-4 py-2 max-w-lg lg:max-w-xl shadow-md ${
                isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {/* Display content directly */}
              <div className="whitespace-pre-wrap">
                 {message.content}
                 {/* Optionally display image description if present */}
                 {message.imageDescription && (
                    <p className="text-xs italic mt-1 opacity-80">[Analyzed Image: {message.imageDescription}]</p>
                 )}
              </div>

              {/* Optional: Timestamp - using timestamp passed from App.jsx */}
              {/* <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p> */}
            </div>
          </div>
        );
      })}
      <div ref={endOfMessagesRef} /> {/* Invisible element to scroll to */}
    </div>
  );
}

export default ChatHistory; 