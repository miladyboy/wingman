import Sidebar from './Sidebar';
import ChatHistory from './ChatHistory';
import UploadComponent from './UploadComponent';
import LoadingDots from './LoadingDots';
import ChatEmptyState from './ChatEmptyState';
import { useState, useRef } from 'react';
import { Menu, PlusSquare, SquarePen, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import apiBase from '@/utils/env';
import { supabase } from '@/services/supabaseClient';

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
  sendingMessage,
  supabase
}) {
  const isNewChat = activeConversationId === 'new';
  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('Active');
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendError, setSuspendError] = useState('');
  const [suspendSuccess, setSuspendSuccess] = useState(false);

  const showEmptyState = conversations.length === 0 || isNewChat;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && error.status !== 403) {
        console.error('Supabase signOut error:', error);
      }
    } catch (e) {
      console.error('Logout exception:', e);
    }
    localStorage.clear();
    sessionStorage.clear();
    // If you use Redux or React context for user, reset it here
    window.location.href = '/';
  };

  // Profile menu dropdown logic
  const handleProfileMenuToggle = () => setIsProfileMenuOpen((open) => !open);
  const handleProfileMenuClose = () => setIsProfileMenuOpen(false);
  const handleAccountOpen = () => {
    setIsAccountModalOpen(true);
    setIsProfileMenuOpen(false);
  };
  const handleAccountClose = () => setIsAccountModalOpen(false);

  const handleSuspendMembership = async () => {
    setSuspendLoading(true);
    setSuspendError('');
    setSuspendSuccess(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('No access token');
      const res = await fetch(`${apiBase}/api/payments/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to cancel subscription');
      }
      const data = await res.json();
      if (data.logout) {
        await handleLogout();
        return;
      }
      setSubscriptionStatus('Inactive');
      setSuspendSuccess(true);
    } catch (err) {
      setSuspendError(err.message || 'Failed to cancel subscription');
    } finally {
      setSuspendLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar
          threads={isNewChat ? conversations.map(c => ({ id: c.id, name: c.title })) : conversations.map(c => ({ id: c.id, name: c.title }) )}
          activeThreadId={isNewChat ? null : activeConversationId}
          onSelectThread={(threadId) => {
            setActiveConversationId(threadId);
            // Potentially close sheet if open, though SheetClose below might handle it
          }}
          onNewThread={() => {
            handleNewThread();
             // Potentially close sheet if open
          }}
          onRenameThread={handleRenameThread}
          onDeleteThread={handleDeleteConversation}
          user={profile}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Sidebar Sheet */}
      <div className="md:hidden">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          {/* SheetTrigger is handled by the custom Menu button below */}
          <SheetContent side="left" className="p-0 w-64 bg-background text-foreground flex flex-col h-full shadow-lg border-r border-border">
            {/* New Mobile Sheet Header - Revised */}
            <div className="p-3 border-b border-border flex justify-between items-center">
              {/* Left side: Hamburger icon to close the sheet */}
              <SheetClose asChild>
                <Button variant="ghost" size="icon" data-testid="sheet-close-hamburger-button">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetClose>

              {/* Right side: New Chat icon */}
              <Button variant="ghost" size="icon" onClick={() => {
                handleNewThread();
                setIsSidebarOpen(false); // Close sheet after action
              }}
              data-testid="sheet-new-chat-button"
              >
                <SquarePen className="h-5 w-5" />
              </Button>
            </div>

            {/* Sidebar component for mobile, without its default header */}
            <Sidebar
              isMobileSheetView={true} // Pass the new prop
              threads={isNewChat ? conversations.map(c => ({ id: c.id, name: c.title })) : conversations.map(c => ({ id: c.id, name: c.title }) )}
              activeThreadId={isNewChat ? null : activeConversationId}
              onSelectThread={(threadId) => {
                setActiveConversationId(threadId);
                setIsSidebarOpen(false); // Close sheet after selection
              }}
              onNewThread={() => {
                handleNewThread();
                setIsSidebarOpen(false); // Close sheet after new thread
              }}
              onRenameThread={handleRenameThread}
              onDeleteThread={handleDeleteConversation}
              user={profile}
              onLogout={() => {
                handleLogout();
                setIsSidebarOpen(false); // Close sheet after logout
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-card p-2 border-b border-border shadow-sm flex justify-between items-center sticky top-0 z-20">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} data-testid="mobile-menu-button">
            <Menu className="h-6 w-6" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground truncate px-2">
            {activeConversation ? activeConversation.title : 'New Chat'}
          </h2>
          {/* Profile button (mobile) */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleProfileMenuToggle}
              data-testid="profile-menu-button-drawer"
              aria-label="Open profile menu"
            >
              <UserCircle className="h-7 w-7" />
            </Button>
            {isProfileMenuOpen && (
              <div
                ref={profileMenuRef}
                className="absolute right-0 mt-2 w-48 bg-card border border-border rounded shadow-lg z-50"
                data-testid="profile-menu-dropdown-mobile"
              >
                <button
                  className="w-full text-left px-4 py-2 hover:bg-accent profile-menu-item"
                  onClick={handleAccountOpen}
                  data-testid="profile-menu-account-mobile"
                >
                  My Account
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-accent text-destructive border-t border-border profile-menu-item"
                  onClick={handleLogout}
                  data-testid="profile-menu-logout-mobile"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex bg-card p-4 border-b border-border shadow-sm justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">{activeConversation ? activeConversation.title : ''}</h2>
          {/* Profile button (desktop) */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleProfileMenuToggle}
              data-testid="profile-menu-button"
              aria-label="Open profile menu"
            >
              <UserCircle className="h-7 w-7" />
            </Button>
            {isProfileMenuOpen && (
              <div
                ref={profileMenuRef}
                className="absolute right-0 mt-2 w-48 bg-card border border-border rounded shadow-lg z-50"
                data-testid="profile-menu-dropdown"
              >
                <button
                  className="w-full text-left px-4 py-2 hover:bg-accent profile-menu-item"
                  onClick={handleAccountOpen}
                  data-testid="profile-menu-account-desktop"
                >
                  My Account
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-accent text-destructive border-t border-border profile-menu-item"
                  onClick={handleLogout}
                  data-testid="profile-menu-logout"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
          {showEmptyState ? (
            <ChatEmptyState />
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
          {sendingMessage && !loadingMessages && (() => {
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

        {(showEmptyState || activeConversationId) && (
          <div className="p-4 border-t border-border bg-card">
            <UploadComponent onSendMessage={handleSendMessage} disabled={sendingMessage} />
          </div>
        )}
      </div>

      {/* Account Modal (Sheet) */}
      <Sheet open={isAccountModalOpen} onOpenChange={setIsAccountModalOpen}>
        <SheetContent side="right" className="max-w-md w-full" data-testid="account-modal">
          <div className="flex flex-col gap-4 p-4">
            <h2 className="text-xl font-bold mb-2">My Account</h2>
            <div className="text-sm text-muted-foreground mb-2">{profile?.email}</div>
            <div className="mb-4">
              <span className="font-semibold">Subscription Status:</span> <span className="ml-2" data-testid="subscription-status">{subscriptionStatus}</span>
            </div>
            <Button
              variant="outline"
              className="w-full deemphasized-action"
              onClick={handleSuspendMembership}
              data-testid="suspend-membership-button"
              disabled={suspendLoading || subscriptionStatus === 'Inactive'}
            >
              {suspendLoading ? 'Suspending...' : 'Suspend Membership'}
            </Button>
            {suspendSuccess && <div className="text-green-600 text-sm mt-2" data-testid="suspend-success">Membership suspended successfully.</div>}
            {suspendError && <div className="text-red-600 text-sm mt-2" data-testid="suspend-error">{suspendError}</div>}
            <SheetClose asChild>
              <Button variant="outline" className="w-full mt-2" onClick={handleAccountClose}>Close</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 