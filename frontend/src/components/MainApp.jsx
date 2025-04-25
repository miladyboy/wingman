import React from 'react';
import Sidebar from './Sidebar';
import ChatHistory from './ChatHistory';
import UploadComponent from './UploadComponent';

export default function MainApp({
  profile,
  conversations,
  activeConversationId,
  setActiveConversationId,
  handleNewThread,
  handleRenameThread,
  messages,
  loading,
  loadingMessages,
  error,
  handleSendMessage,
  supabase
}) {
  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

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
              imageUrls: m.imageUrls || [],
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
  );
} 