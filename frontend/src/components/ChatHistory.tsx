import { useEffect, useRef, useState, useCallback } from "react";
import ChatMessage from "./ChatMessage";
import type { Message } from "../utils/messageUtils";

/**
 * Props interface for ChatHistory component.
 */
interface ChatHistoryProps {
  history: Message[];
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

  const handleImageLoad = useCallback(
    (index: number) => {
      if (index === history.length - 1) {
        setImagesLoaded((l) => l + 1);
      }
    },
    [history.length]
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
      {history.map((message, index) => (
        <ChatMessage
          key={message.id || index}
          message={message}
          isUser={message.role === "user" || message.sender === "user"}
          onImageLoad={() => handleImageLoad(index)}
        />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
}

export default ChatHistory;
