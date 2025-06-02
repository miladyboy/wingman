import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChatImages from "./ChatImages";

/**
 * Message interface for ChatHistory component.
 */
interface ChatMessage {
  id?: string;
  role?: string;
  sender?: string;
  content: string;
  imageUrls?: string[];
  imageDescription?: string;
  timestamp?: number;
  failed?: boolean;
}

/**
 * Props interface for ChatHistory component.
 */
interface ChatHistoryProps {
  history: ChatMessage[];
}

// Updated props based on App.tsx
function ChatHistory({ history }: ChatHistoryProps) {
  // REMOVED: Log the received history prop for debugging
  // console.log("[ChatHistory] Received history prop:", history);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [imagesToLoad, setImagesToLoad] = useState(0);

  // Track the number of images in the latest message
  useEffect(() => {
    if (!history || history.length === 0) {
      setImagesToLoad(0);
      setImagesLoaded(0);
      return;
    }
    const lastMsg = history[history.length - 1];
    const count = Array.isArray(lastMsg.imageUrls)
      ? lastMsg.imageUrls.length
      : 0;
    setImagesToLoad(count);
    setImagesLoaded(0);
    if (count === 0) {
      // No images, scroll immediately
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  // When all images are loaded, scroll to bottom
  useEffect(() => {
    if (imagesToLoad > 0 && imagesLoaded >= imagesToLoad) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [imagesLoaded, imagesToLoad]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background min-h-0">
      {/* Map over history using new structure */}
      {history.map((message, index) => {
        // Use 'sender' or 'role' based on your data structure
        const isUser = message.role === "user" || message.sender === "user"; // Adapt based on actual field name

        return (
          <div
            key={message.id || index}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            data-testid="chat-message"
            data-message-id={message.id || index}
            data-sender={isUser ? "user" : "bot"}
          >
            {isUser ? (
              <Card
                className={`max-w-lg lg:max-w-xl shadow-md break-words border border-border ml-auto bg-primary text-primary-foreground`}
              >
                <CardContent className="p-4">
                  {/* Display content directly */}
                  {message.content && (
                    <div
                      className="whitespace-pre-wrap"
                      data-testid="chat-message-content"
                    >
                      {message.content}
                    </div>
                  )}

                  <ChatImages
                    urls={message.imageUrls || []}
                    failed={message.failed}
                    align={isUser ? "end" : "start"}
                    onImageLoad={() => {
                      if (index === history.length - 1) {
                        setImagesLoaded((l) => l + 1);
                      }
                    }}
                  />
                  {/* Optional: Timestamp - using timestamp passed from App.tsx */}
                  {/* <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p> */}
                </CardContent>
              </Card>
            ) : (
              <Card
                className={
                  "max-w-lg lg:max-w-xl shadow-md break-words border border-border mr-auto bg-card text-card-foreground"
                }
              >
                <CardContent className="p-4">
                  {message.content && (
                    <div
                      className="whitespace-pre-wrap"
                      data-testid="chat-message-content"
                    >
                      {message.content}
                    </div>
                  )}
                  <ChatImages
                    urls={message.imageUrls || []}
                    failed={message.failed}
                    onImageLoad={() => {
                      if (index === history.length - 1) {
                        setImagesLoaded((l) => l + 1);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        );
      })}
      <div ref={endOfMessagesRef} /> {/* Invisible element to scroll to */}
    </div>
  );
}

export default ChatHistory;
