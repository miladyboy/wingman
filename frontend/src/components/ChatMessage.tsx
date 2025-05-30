import { Card, CardContent } from "@/components/ui/card";
import type { Message } from "../utils/messageUtils";
import React from "react";

interface ChatMessageProps {
  message: Message;
  isUser: boolean;
  onImageLoad?: () => void;
}

const ChatMessage = ({ message, isUser, onImageLoad }: ChatMessageProps) => (
  <div
    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    data-testid="chat-message"
    data-message-id={message.id}
    data-sender={isUser ? "user" : "bot"}
  >
    <Card
      className={`max-w-lg lg:max-w-xl shadow-md break-words border border-border ${
        isUser
          ? "ml-auto bg-primary text-primary-foreground"
          : "mr-auto bg-card text-card-foreground"
      }`}
    >
      <CardContent className="p-4">
        {message.content && (
          <div className="whitespace-pre-wrap" data-testid="chat-message-content">
            {message.content}
          </div>
        )}
        {message.imageUrls && message.imageUrls.length > 0 && (
          <div
            className={`mt-2 flex flex-wrap gap-2 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            {message.imageUrls.map((url, idx) => (
              <div key={idx} className="relative">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={url}
                    alt={`Uploaded image ${idx + 1}`}
                    className="max-w-[150px] max-h-[150px] sm:max-w-[200px] sm:max-h-[200px] rounded object-cover border border-border hover:opacity-90 transition-opacity"
                    style={
                      message.failed ? { filter: "grayscale(1)", opacity: 0.5 } : {}
                    }
                    onLoad={onImageLoad}
                    data-testid="chat-message-image"
                  />
                </a>
                {message.failed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-destructive/60 text-white font-bold text-xs rounded">
                    Upload failed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

export default ChatMessage;
