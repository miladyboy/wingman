import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './guards/RequireAuth';
import RedirectIfAuth from './guards/RedirectIfAuth';
import RequireSubscription from './guards/RequireSubscription';
import RedirectIfSubscribed from './guards/RedirectIfSubscribed';
import Auth from './Auth';
import LandingPage from './LandingPage';
import Subscribe from './Subscribe';
import MainApp from './MainApp';

/**
 * AppRoutes handles all application routing and route guards.
 * @param {object} props
 * @param {object|null} props.session - The current user session.
 * @param {object|null} props.profile - The current user profile.
 * @param {Array} props.conversations - List of user conversations.
 * @param {string|null} props.activeConversationId - The currently active conversation ID.
 * @param {function} props.setActiveConversationId - Setter for active conversation ID.
 * @param {function} props.handleNewThread - Handler to start a new thread.
 * @param {function} props.handleRenameThread - Handler to rename a thread.
 * @param {function} props.handleDeleteConversation - Handler to delete a conversation.
 * @param {Array} props.messages - List of messages in the active conversation.
 * @param {boolean} props.loading - Loading state for general actions.
 * @param {boolean} props.loadingMessages - Loading state for messages.
 * @param {string|null} props.error - Error message, if any.
 * @param {function} props.handleSendMessage - Handler to send a message.
 * @param {object} props.supabase - Supabase client instance.
 * @param {boolean} props.sendingMessage - Loading state for sending a message.
 */
function AppRoutes({
  session,
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
  sendingMessage,
  supabase
}) {
  return (
    <Routes>
      <Route path="/" element={
        <RedirectIfAuth session={session}>
          <LandingPage onRequestAccess={() => window.location.href = '/auth'} />
        </RedirectIfAuth>
      } />
      <Route path="/auth" element={
        <RedirectIfAuth session={session}>
          <Auth />
        </RedirectIfAuth>
      } />
      <Route path="/subscribe" element={
        <RedirectIfSubscribed>
          <Subscribe />
        </RedirectIfSubscribed>
      } />
      <Route path="/app" element={
        <RequireAuth session={session}>
          <RequireSubscription>
            <MainApp
              profile={profile}
              conversations={conversations}
              activeConversationId={activeConversationId}
              setActiveConversationId={setActiveConversationId}
              handleNewThread={handleNewThread}
              handleRenameThread={handleRenameThread}
              handleDeleteConversation={handleDeleteConversation}
              messages={messages}
              loading={loading}
              loadingMessages={loadingMessages}
              error={error}
              handleSendMessage={handleSendMessage}
              sendingMessage={sendingMessage}
              supabase={supabase}
            />
          </RequireSubscription>
        </RequireAuth>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes; 