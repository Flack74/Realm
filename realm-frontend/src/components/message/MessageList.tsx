import React from 'react';

interface Message {
  id: string;
  content: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  edited_at?: string;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getAvatarUrl = (user: Message['user']) => {
    return user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=5865f2&color=fff`;
  };

  const shouldGroupMessage = (currentMsg: Message, prevMsg: Message | undefined) => {
    if (!prevMsg) return false;
    
    const timeDiff = new Date(currentMsg.created_at).getTime() - new Date(prevMsg.created_at).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return (
      prevMsg.user.id === currentMsg.user.id &&
      timeDiff < fiveMinutes
    );
  };

  return (
    <div className="space-y-1">
      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : undefined;
        const isGrouped = shouldGroupMessage(message, prevMessage);

        return (
          <div
            key={message.id}
            className={`group hover:bg-gray-800 hover:bg-opacity-50 px-4 py-1 ${
              isGrouped ? 'py-0.5' : 'py-2'
            } transition-colors`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className={`flex-shrink-0 ${isGrouped ? 'w-10' : ''}`}>
                {!isGrouped && (
                  <img
                    src={getAvatarUrl(message.user)}
                    alt={message.user.username}
                    className="w-10 h-10 rounded-full"
                  />
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                {!isGrouped && (
                  <div className="flex items-baseline space-x-2 mb-1">
                    <span className="font-semibold text-white">
                      {message.user.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(message.created_at)}
                    </span>
                    {message.edited_at && (
                      <span className="text-xs text-gray-500">(edited)</span>
                    )}
                  </div>
                )}

                <div className={`text-gray-300 ${isGrouped ? 'ml-0' : ''}`}>
                  {/* Message timestamp for grouped messages */}
                  {isGrouped && (
                    <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 mr-2">
                      {formatTime(message.created_at)}
                    </span>
                  )}
                  
                  {/* Message text */}
                  <span className="break-words">{message.content}</span>
                  
                  {/* Edited indicator for grouped messages */}
                  {isGrouped && message.edited_at && (
                    <span className="text-xs text-gray-500 ml-1">(edited)</span>
                  )}
                </div>

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {message.reactions.map((reaction, idx) => (
                      <button
                        key={idx}
                        className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 rounded-full px-2 py-1 text-xs transition-colors"
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-gray-300">{reaction.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Actions (visible on hover) */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                  <span className="text-sm">😀</span>
                </button>
                <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                  <span className="text-sm">💬</span>
                </button>
                <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                  <span className="text-sm">⋯</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};