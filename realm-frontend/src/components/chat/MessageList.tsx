import React, { useEffect, useRef } from 'react';
import { MessageComponent } from './MessageComponent';

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

interface MessageListProps {
  messages: Message[];
  channelId: string;
  onMessagesUpdate: (messages: Message[]) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, channelId, onMessagesUpdate }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/v1/protected/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ emoji })
      });
      
      if (response.ok) {
        // Reload messages to show updated reactions
        const messagesResponse = await fetch(`/api/v1/protected/channels/${channelId}/messages`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (messagesResponse.ok) {
          const updatedMessages = await messagesResponse.json();
          onMessagesUpdate(updatedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleEdit = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/v1/protected/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newContent })
      });
      
      if (response.ok) {
        // Reload messages to show updated content
        const messagesResponse = await fetch(`/api/v1/protected/channels/${channelId}/messages`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (messagesResponse.ok) {
          const updatedMessages = await messagesResponse.json();
          onMessagesUpdate(updatedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      const response = await fetch(`/api/v1/protected/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        // Remove message from local state
        const updatedMessages = messages.filter(m => m.id !== messageId);
        onMessagesUpdate(updatedMessages);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
          <p className="text-gray-400">Be the first to send a message!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showHeader = !prevMessage || 
          prevMessage.user.id !== message.user.id ||
          new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000; // 5 minutes

        return (
          <MessageComponent
            key={message.id}
            message={message}
            showHeader={showHeader}
            onReaction={handleReaction}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};