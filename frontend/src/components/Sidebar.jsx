import React, { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function Sidebar({ threads, activeThreadId, onSelectThread, onNewThread, onRenameThread, user, onLogout }) {
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editText, setEditText] = useState('');

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
    <div className="w-64 bg-gray-800 text-white flex flex-col h-full shadow-lg">
      {/* Header / New Chat Button */}
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={onNewThread}
          className="w-full font-bold"
        >
          + New Chat
        </Button>
      </div>

      {/* Thread List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`group flex items-center justify-between p-2 rounded cursor-pointer transition duration-150 ease-in-out ${
              activeThreadId && activeThreadId === thread.id
                ? 'bg-gray-700'
                : 'hover:bg-gray-700/50'
            }`}
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
                  className="flex-grow bg-gray-600 text-white px-2 py-1 rounded mr-1 text-sm"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}
                  className="text-green-400 hover:text-green-300"
                  aria-label="Save name"
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                  className="text-red-400 hover:text-red-300"
                  aria-label="Cancel rename"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // --- Display State ---
              <>
                <span className="flex-1 truncate text-sm" title={thread.name}>
                  {thread.name}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handleStartEdit(thread); }}
                  className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  aria-label="Rename chat"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}
        {threads.length === 0 && (
           <p className="text-center text-gray-500 text-sm mt-4 px-2">No chats yet.</p>
        )}
      </nav>

      {/* --- User Info & Logout --- */}
      <div className="p-4 border-t border-gray-700 mt-auto">
        {user && (
          <div className="text-sm text-gray-400 mb-2 truncate" title={user.email}>
            Logged in as: {user.username || user.email}
          </div>
        )}
        <Button
          onClick={onLogout}
          className="w-full flex items-center justify-center font-bold text-sm bg-red-600 hover:bg-red-700"
        >
          <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      {/* --- End User Info & Logout --- */}
    </div>
  );
}

export default Sidebar; 