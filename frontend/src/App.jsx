import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import MainApp from './components/MainApp';
import './index.css';
import RequireAuth from './components/guards/RequireAuth';
import RedirectIfAuth from './components/guards/RedirectIfAuth';
import RequireSubscription from './components/guards/RequireSubscription';
import RedirectIfSubscribed from './components/guards/RedirectIfSubscribed';
import Subscribe from './components/Subscribe';
import { useAuthSession } from './hooks/useAuthSession';
import { useUserProfile } from './hooks/useUserProfile';
import { useChatState } from './hooks/useChatState';

function AppRouter() {
  const { session } = useAuthSession();
  const { profile, loadingProfile, profileError } = useUserProfile(session?.user);
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    loadingConversations,
    conversationsError,
    messages,
    loadingMessages,
    messagesError,
    handleNewThread,
    handleSendMessage,
    sendingMessage,
    sendMessageError,
    handleRenameThread,
    handleDeleteConversation,
    operationLoading, 
    operationError,
  } = useChatState(session);

  const overallLoading = loadingProfile || loadingConversations || sendingMessage || operationLoading;
  const overallError = profileError || conversationsError || messagesError || sendMessageError || operationError;

  const handleDeleteConversationWithConfirmation = async (conversationId) => {
    if (window.confirm('Are you sure you want to delete this conversation and all its messages and images? This cannot be undone.')) {
      await handleDeleteConversation(conversationId);
    }
  };

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
              handleDeleteConversation={handleDeleteConversationWithConfirmation}
              messages={messages}
              loading={overallLoading}
              loadingMessages={loadingMessages}
              error={overallError}
              handleSendMessage={handleSendMessage}
              supabase={supabase}
            />
          </RequireSubscription>
        </RequireAuth>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
