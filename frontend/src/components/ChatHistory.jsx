import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// SuggestionsComponent might not be needed anymore if AI response is plain text
// import SuggestionsComponent from './SuggestionsComponent';

// Updated props based on App.jsx
function ChatHistory({ history }) {
  // REMOVED: Log the received history prop for debugging
  // console.log("[ChatHistory] Received history prop:", history);

  const endOfMessagesRef = useRef(null);

  // Scroll to the bottom when history changes
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {/* Map over history using new structure */}
      {history.map((message, index) => {
        // Use 'sender' or 'role' based on your data structure
        const isUser = message.role === 'user' || message.sender === 'user'; // Adapt based on actual field name

        return (
          <div key={message.id || index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <Card
              className={`max-w-lg lg:max-w-xl shadow-md break-words ${
                isUser
                  ? 'ml-auto bg-blue-500 text-white border-blue-400'
                  : 'bg-white text-gray-800 border-gray-200'
              }`}
            >
              <CardContent className="p-4">
                {/* Display content directly */}
                {message.content && (
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}

                {/* ADDED: Display images if imageUrls array exists */}
                {message.imageUrls && message.imageUrls.length > 0 && (
                  <div className={`mt-2 flex flex-wrap gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {message.imageUrls.map((url, imgIndex) => {
                      // REMOVED: Log inside the image map
                      // console.log(`[ChatHistory] Rendering image ${imgIndex} for message ${message.id || index} with URL:`, url);
                      return (
                        <a key={imgIndex} href={url} target="_blank" rel="noopener noreferrer" className="block">
                          <img
                            src={url}
                            alt={`Uploaded image ${imgIndex + 1}`}
                            className="max-w-[150px] max-h-[150px] sm:max-w-[200px] sm:max-h-[200px] rounded object-cover border border-gray-300 hover:opacity-90 transition-opacity"
                          />
                        </a>
                      );
                    })}
                  </div>
                )}
                {/* Optional: Timestamp - using timestamp passed from App.jsx */}
                {/* <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p> */}
              </CardContent>
            </Card>
          </div>
        );
      })}
      <div ref={endOfMessagesRef} /> {/* Invisible element to scroll to */}
    </div>
  );
}

export default ChatHistory; 