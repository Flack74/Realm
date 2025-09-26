import React, { useState } from 'react';
import { MoreHorizontal, Edit3, Trash2, Reply, Smile } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  content: string;
  user: {
    id: string;
    username: string;
    display_name?: string;
    avatar?: string;
  };
  created_at: string;
  edited: boolean;
  reply_to?: string;
  thread_id?: string;
}

interface MessageComponentProps {
  message: Message;
  showHeader: boolean;
  onReaction: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

export const MessageComponent: React.FC<MessageComponentProps> = ({
  message,
  showHeader,
  onReaction,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isOwnMessage = user?.id === message.user.id;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveEdit = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👎', '🎉'];

  return (
    <div
      className={`group hover:bg-gray-800 hover:bg-opacity-30 px-4 py-1 rounded transition-colors ${
        showHeader ? 'mt-4' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {showHeader && (
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {message.user.avatar ? (
              <img
                src={message.user.avatar}
                alt={message.user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (message.user.display_name || message.user.username).charAt(0).toUpperCase()
            )}
          </div>
        )}
        
        {!showHeader && <div className="w-10 flex-shrink-0" />}

        <div className="flex-1 min-w-0">
          {showHeader && (
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="font-semibold text-white">
                {message.user.display_name || message.user.username}
              </span>
              <span className="text-xs text-gray-400">
                {formatTime(message.created_at)}
              </span>
              {message.edited && (
                <span className="text-xs text-gray-500">(edited)</span>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-300 break-words">
              {message.content}
            </div>
          )}
        </div>

        {/* Message Actions */}
        {showActions && !isEditing && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              title="Add reaction"
            >
              <Smile className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            
            <button
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              title="Reply"
            >
              <Reply className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>

            {isOwnMessage && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                  title="Edit message"
                >
                  <Edit3 className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
                
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
              </>
            )}

            <button className="p-1 rounded hover:bg-gray-700 transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute z-10 mt-2 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <div className="grid grid-cols-4 gap-1">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReaction(message.id, emoji);
                  setShowEmojiPicker(false);
                }}
                className="p-2 hover:bg-gray-700 rounded text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};