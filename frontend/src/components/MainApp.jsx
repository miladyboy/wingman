import React from 'react';
import Sidebar from './Sidebar';
import ChatHistory from './ChatHistory';
import UploadComponent from './UploadComponent';
import LoadingDots from './LoadingDots';
import { useNavigate } from 'react-router-dom';

export default function MainApp({
  profile,
  conversations,
  activeConversationId,
  setActiveConversationId,
  handleNewThread,
  handleRenameThread,
  handleDeleteConversation,
  messages,
  loading,
  loadingMessages,
  error,
  handleSendMessage,
  supabase
}) {
  const isNewChat = activeConversationId === 'new';
  const activeConversation = conversations.find(conv => conv.id === activeConversationId);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        threads={isNewChat ? conversations.map(c => ({ id: c.id, name: c.title })) : conversations.map(c => ({ id: c.id, name: c.title }) )}
        activeThreadId={isNewChat ? null : activeConversationId}
        onSelectThread={setActiveConversationId}
        onNewThread={handleNewThread}
        onRenameThread={handleRenameThread}
        onDeleteThread={handleDeleteConversation}
        user={profile}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeConversation && (
          <div className="bg-card p-4 border-b border-border shadow-sm flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">{activeConversation.title}</h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
          {isNewChat ? (
            <div className="text-center text-muted-foreground pt-10">
              Start your new conversation by sending a message.
            </div>
          ) : activeConversationId ? (
            <ChatHistory history={messages.map(m => ({
              role: m.sender,
              content: m.content,
              imageDescription: m.image_description,
              imageUrls: m.imageUrls || [],
              timestamp: new Date(m.created_at).getTime()
            }))} />
          ) : (
            <div className="text-center text-muted-foreground pt-10">
              Select a conversation or start a new one.
            </div>
          )}
          {loadingMessages && (
            <div className="text-center py-4 text-muted-foreground">Loading messages...</div>
          )}
          {loading && !loadingMessages && (() => {
            // Find the latest agent message (role/sender !== 'user')
            const lastAgentMsg = [...messages].reverse().find(m => (m.role !== 'user' && m.sender !== 'user'));
            const agentHasContent = lastAgentMsg && lastAgentMsg.content && lastAgentMsg.content.trim().length > 0;
            if (agentHasContent) return null;
            return (
              <div className="flex justify-start">
                <div className="max-w-lg lg:max-w-xl px-4 py-3 text-foreground">
                  <LoadingDots />
                </div>
              </div>
            );
          })()}
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>

        {isNewChat || activeConversationId ? (
          <div className="p-4 border-t border-border bg-card">
            <UploadComponent onSendMessage={handleSendMessage} disabled={loading} />
          </div>
        ) : null}
      </div>
    </div>
  );
} 