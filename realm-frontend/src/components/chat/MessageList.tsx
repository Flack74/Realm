import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';

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

interface MessageListProps {
  channelId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ channelId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock messages data
  const messages: Message[] = [
    {
      id: '1',
      content: 'Welcome to the general channel! 👋',
      author: { id: '1', username: 'admin', avatar: undefined },
      timestamp: new Date(Date.now() - 3600000),
      reactions: [
        { emoji: '👋', count: 3, users: ['2', '3', '4'] },
        { emoji: '🎉', count: 1, users: ['2'] }
      ]
    },
    {
      id: '2',
      content: 'Thanks for the welcome! This looks great.',
      author: { id: '2', username: 'user1' },
      timestamp: new Date(Date.now() - 3000000),
      replyTo: {
        id: '1',
        author: 'admin',
        content: 'Welcome to the general channel! 👋'
      }
    },
    {
      id: '3',
      content: 'I agree! The interface is really clean and Discord-like.',
      author: { id: '3', username: 'user2' },
      timestamp: new Date(Date.now() - 1800000),
      edited: true
    },
    {
      id: '4',
      content: 'Has anyone tried the voice channels yet?',
      author: { id: '4', username: 'user3' },
      timestamp: new Date(Date.now() - 600000)
    }
  ];

  const typingUsers = ['user4', 'user5'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {/* Welcome Message */}
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
          #
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to #general!</h2>
        <p className="text-gray-400">This is the start of the #general channel.</p>
      </div>

      {/* Messages */}
      {messages.map((message, index) => {
        const prevMessage = messages[index - 1];
        const showAvatar = !prevMessage || 
          prevMessage.author.id !== message.author.id ||
          (message.timestamp.getTime() - prevMessage.timestamp.getTime()) > 300000; // 5 minutes

        return (
          <MessageItem
            key={message.id}
            message={message}
            showAvatar={showAvatar}
          />
        );
      })}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};