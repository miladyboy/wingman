import React, { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

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
        <button
          onClick={onNewThread}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          + New Chat
        </button>
      </div>

      {/* Thread List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`group flex items-center justify-between p-2 rounded cursor-pointer transition duration-150 ease-in-out ${
              activeThreadId === thread.id
                ? 'bg-gray-700'
                : 'hover:bg-gray-700/50'
            }`}
            onClick={() => editingThreadId !== thread.id && onSelectThread(thread.id)} // Don't select if editing
          >
            {editingThreadId === thread.id ? (
              // --- Editing State ---
              <div className="flex-1 flex items-center mr-1">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-grow bg-gray-600 text-white px-2 py-1 rounded mr-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  autoFocus
                  onBlur={handleCancelEdit} // Cancel if clicked outside while editing (simple approach)
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}
                  className="p-1 text-green-400 hover:text-green-300"
                  aria-label="Save name"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                  className="p-1 text-red-400 hover:text-red-300"
                  aria-label="Cancel rename"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              // --- Display State ---
              <>
                <span className="flex-1 truncate text-sm" title={thread.name}>
                  {thread.name}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleStartEdit(thread); }}
                  className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  aria-label="Rename chat"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
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
            Logged in as: {user.username || user.email} {/* Display username or email */}
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out text-sm"
        >
          <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
      {/* --- End User Info & Logout --- */}
    </div>
  );
}

export default Sidebar; 