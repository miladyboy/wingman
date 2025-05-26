import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./guards/RequireAuth";
import RedirectIfAuth from "./guards/RedirectIfAuth";
import RequireSubscription from "./guards/RequireSubscription";
import RedirectIfSubscribed from "./guards/RedirectIfSubscribed";
import Auth from "./Auth";
import LandingPage from "./LandingPage";
import Subscribe from "./Subscribe";
import MainApp from "./MainApp";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfUse from "./TermsOfUse";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { Conversation } from "../hooks/useConversations";
import type { Message } from "../utils/messageUtils";

/**
 * Props interface for AppRoutes component.
 */
interface AppRoutesProps {
  session: Session | null;
  profile: any;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  handleNewThread: () => void;
  handleRenameThread: (conversationId: string, newName: string) => void;
  handleDeleteConversation: (conversationId: string) => void;
  messages: Message[];
  loading: boolean;
  loadingMessages: boolean;
  error: string | null;
  handleSendMessage: (formData: FormData) => void;
  sendingMessage: boolean;
  supabase: SupabaseClient;
}

/**
 * AppRoutes handles all application routing and route guards.
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
  supabase,
}: AppRoutesProps) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfAuth session={session}>
            <LandingPage
              onRequestAccess={() => (window.location.href = "/auth")}
            />
          </RedirectIfAuth>
        }
      />
      <Route
        path="/auth"
        element={
          <RedirectIfAuth session={session}>
            <Auth />
          </RedirectIfAuth>
        }
      />
      <Route
        path="/subscribe"
        element={
          <RedirectIfSubscribed>
            <Subscribe />
          </RedirectIfSubscribed>
        }
      />
      <Route
        path="/app"
        element={
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
        }
      />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
