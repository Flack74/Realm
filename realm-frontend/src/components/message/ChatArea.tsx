import React, { useEffect, useState, useRef } from 'react';
import { messageService } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

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

interface ChatAreaProps {
  channelId: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ channelId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages: wsMessages, startTyping, stopTyping } = useWebSocket();

  useEffect(() => {
    loadMessages();
  }, [channelId]);

  useEffect(() => {
    // Handle WebSocket messages
    wsMessages.forEach(wsMessage => {
      if (wsMessage.type === 'new_message' && wsMessage.channel_id === channelId) {
        setMessages(prev => [...prev, wsMessage.data]);
        scrollToBottom();
      } else if (wsMessage.type === 'typing') {
        handleTypingUpdate(wsMessage.data);
      }
    });
  }, [wsMessages, channelId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const channelMessages = await messageService.getMessages(channelId);
      setMessages(channelMessages.reverse()); // Reverse to show newest at bottom
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      await messageService.sendMessage(channelId, content);
      // Message will be added via WebSocket
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTypingUpdate = (data: { user_id: string; is_typing: boolean }) => {
    setTypingUsers(prev => {
      if (data.is_typing) {
        return prev.includes(data.user_id) ? prev : [...prev, data.user_id];
      } else {
        return prev.filter(id => id !== data.user_id);
      }
    });

    // Clear typing after 3 seconds
    if (data.is_typing) {
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== data.user_id));
      }, 3000);
    }
  };

  const handleTypingStart = () => {
    startTyping(channelId);
  };

  const handleTypingStop = () => {
    stopTyping(channelId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <h2 className="text-white font-semibold"># general</h2>
        <p className="text-gray-400 text-sm">Welcome to the general channel</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="text-gray-400 text-sm italic mb-2">
            {typingUsers.length === 1 
              ? `Someone is typing...`
              : `${typingUsers.length} people are typing...`
            }
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        placeholder="Message #general"
      />
    </div>
  );
};