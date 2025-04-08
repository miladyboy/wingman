import React, { useEffect, useRef } from 'react';
import SuggestionsComponent from './SuggestionsComponent'; // Re-use for displaying suggestions

function ChatHistory({ history }) {
  const endOfMessagesRef = useRef(null);

  // Scroll to the bottom when history changes
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {history.map((message, index) => {
        const isUser = message.role === 'user';
        const suggestions = message.role === 'assistant' 
            ? message.content.split('\n\n---\n\n').filter(s => s.trim() !== '') 
            : [];

        return (
          <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`rounded-lg px-4 py-2 max-w-lg lg:max-w-xl shadow-md ${
                isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {isUser ? (
                // User Message Display
                <div className="whitespace-pre-wrap">
                  {message.content} 
                  {/* Display image description if it existed, maybe style differently */}
                  {/* {message.imageDescription && (
                    <p className="text-xs italic mt-1 opacity-80">Image: {message.imageDescription}</p>
                  )} */}
                </div>
              ) : (
                // Assistant Message Display (using SuggestionsComponent)
                <SuggestionsComponent suggestions={suggestions} />
              )}
              {/* Optional: Timestamp */}
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