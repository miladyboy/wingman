import React from 'react';

/**
 * ChatEmptyState displays a message when there are no chats or a new chat is being started.
 * Used in MainApp to provide a consistent empty state UI.
 */
export default function ChatEmptyState() {
  return (
    <div className="text-center text-muted-foreground pt-10">
      Start your new conversation by sending a message.
    </div>
  );
} 