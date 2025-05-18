import { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserPreferences from './UserPreferences';
import { filterThreadsByName } from '../utils/threadUtils';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from './ui/dialog';

function Sidebar({ threads, activeThreadId, onSelectThread, onNewThread, onRenameThread, onDeleteThread, isMobileSheetView = false }) {
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editText, setEditText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);

  const handleStartEdit = (thread) => {
    setEditingThreadId(thread.id);
    setEditText(thread.name);
  };

  const handleCancelEdit = () => {
    setEditingThreadId(null);
    setEditText('');
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editingThreadId) {
      onRenameThread(editingThreadId, editText.trim());
    }
    handleCancelEdit(); // Exit editing mode regardless
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSaveEdit();
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="w-64 bg-background text-foreground flex flex-col h-full shadow-lg border-r border-border">
      {/* Header Area: Contains New Chat button (desktop only) and Search Input (always) */}
      <div className="px-4 pb-3 border-b border-border">
        {!isMobileSheetView && (
          <Button
            onClick={onNewThread}
            className="w-full font-bold mb-3"
            data-testid="new-chat-button"
          >
            + New Chat
          </Button>
        )}
        <Input
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            console.log('[Sidebar] searchQuery:', e.target.value);
          }}
          placeholder="Search chats…"
          data-testid="chat-search-input"
          aria-label="Buscar chats"
        />
      </div>

      {/* Thread List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {(() => {
          const filteredThreads = filterThreadsByName(threads, searchQuery);
          if (filteredThreads.length === 0) {
            return <p className="text-center text-muted-foreground text-sm mt-4 px-2">No chats found.</p>;
          }
          return filteredThreads.map((thread) => (
            <div
              key={thread.id}
              className={`group flex items-center justify-between p-2 rounded cursor-pointer transition duration-150 ease-in-out
                ${activeThreadId && activeThreadId === thread.id
                  ? 'bg-primary/20'
                  : 'hover:bg-accent/30'}
              `}
              data-active={activeThreadId === thread.id ? 'true' : undefined}
              data-testid="chat-item"
              data-thread-id={thread.id}
              onClick={() => editingThreadId !== thread.id && onSelectThread(thread.id)} // Don't select if editing
            >
              {editingThreadId === thread.id ? (
                // --- Editing State ---
                <div className="flex-1 flex items-center mr-1 gap-1">
                  <Input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-input text-foreground px-2 py-1 rounded mr-1 text-sm border border-border"
                    autoFocus
                    data-testid="rename-chat-input"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}
                    className="text-green-500 hover:text-green-400"
                    aria-label="Save name"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                    className="text-red-500 hover:text-red-400"
                    aria-label="Cancel rename"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                // --- Display State ---
                <>
                  <span className="flex-1 truncate text-sm" title={thread.name} data-testid="chat-item-name">
                    {thread.name}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleStartEdit(thread); }}
                    className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    aria-label="Rename chat"
                    data-testid="rename-chat-button"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThreadToDelete(thread.id);
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-1"
                    aria-label="Delete chat"
                    data-testid="delete-chat"
                  >
                    <span role="img" aria-label="Delete">🗑️</span>
                  </Button>
                </>
              )}
            </div>
          ));
        })()}
      </nav>

      {/* --- User Info & Logout --- */}
      <div className="p-4 border-t border-border mt-auto">
        <UserPreferences
          trigger={<Button className="w-full mb-2" variant="outline" data-testid="edit-preferences">Edit Preferences</Button>}
        />
      </div>
      {/* --- End User Info & Logout --- */}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation and all its messages and images? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-testid="confirm-delete-chat"
              onClick={() => {
                if (onDeleteThread && threadToDelete) onDeleteThread(threadToDelete);
                setShowDeleteDialog(false);
                setThreadToDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Sidebar; 