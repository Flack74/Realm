import React, { useState } from 'react';
import { MoreHorizontal, Reply, Edit, Trash2, Pin } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { MessageReactions } from './MessageReactions';

interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: Date;
  edited?: boolean;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  replyTo?: {
    id: string;
    author: string;
    content: string;
  };
}

interface MessageItemProps {
  message: Message;
  showAvatar: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  showAvatar
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div 
      className="group hover:bg-gray-750 px-4 py-1 -mx-4 relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Reply Reference */}
      {message.replyTo && (
        <div className="flex items-center text-sm text-gray-400 mb-1 ml-14">
          <Reply size={14} className="mr-1" />
          <span className="font-medium">{message.replyTo.author}</span>
          <span className="ml-1 truncate max-w-xs">{message.replyTo.content}</span>
        </div>
      )}

      <div className="flex">
        {/* Avatar */}
        <div className="w-10 mr-4 flex-shrink-0">
          {showAvatar && (
            <Avatar
              src={message.author.avatar}
              alt={message.author.username}
              fallback={message.author.username}
              size="md"
            />
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          {showAvatar && (
            <div className="flex items-baseline mb-1">
              <span className="font-semibold text-white mr-2">
                {message.author.username}
              </span>
              <span className="text-xs text-gray-400">
                {formatTime(message.timestamp)}
                {message.edited && (
                  <span className="ml-1 text-gray-500">(edited)</span>
                )}
              </span>
            </div>
          )}

          {/* Message Text */}
          <div className="text-gray-100 break-words">
            {isEditing ? (
              <div className="bg-gray-700 rounded p-2">
                <input
                  type="text"
                  defaultValue={message.content}
                  className="w-full bg-transparent text-white focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditing(false);
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  autoFocus
                />
                <div className="text-xs text-gray-400 mt-1">
                  Press Enter to save • Escape to cancel
                </div>
              </div>
            ) : (
              <span>{message.content}</span>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <MessageReactions reactions={message.reactions} messageId={message.id} />
          )}
        </div>

        {/* Message Actions */}
        {showActions && !isEditing && (
          <div className="absolute top-0 right-4 bg-gray-800 border border-gray-600 rounded shadow-lg flex">
            <button
              className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white"
              title="Add Reaction"
            >
              😊
            </button>
            <button
              className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white"
              title="Reply"
            >
              <Reply size={16} />
            </button>
            <button
              className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white"
              title="Edit Message"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={16} />
            </button>
            <button
              className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white"
              title="More"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};