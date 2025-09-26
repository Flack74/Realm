import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  edited_at?: string;
  reply_to?: {
    id: string;
    content: string;
    author: { username: string; };
  };
  reactions?: Array<{
    emoji_name: string;
    count: number;
    me: boolean;
    users: Array<{ id: string; username: string; }>;
  }>;
}

interface ChatAreaProps {
  channelId: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ channelId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<Message['reply_to']>();
  const [typingUsers, setTypingUsers] = useState<Array<{ id: string; username: string; }>>([]);

  useEffect(() => {
    if (channelId) {
      loadMessages();
    }
  }, [channelId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/protected/channels/${channelId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const transformedMessages = data.map((msg: any) => ({
          ...msg,
          author: {
            id: msg.user_id || msg.author_id,
            username: msg.username || msg.author?.username,
            display_name: msg.display_name || msg.author?.display_name,
            avatar_url: msg.avatar_url || msg.author?.avatar_url
          }
        }));
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, replyToId?: string) => {
    try {
      const response = await fetch(`/api/v1/protected/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          content,
          reply_to: replyToId
        })
      });
      
      if (response.ok) {
        setReplyTo(undefined);
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      const response = await fetch(`/api/v1/protected/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`/api/v1/protected/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await fetch(`/api/v1/protected/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ emoji_name: emoji })
      });
      loadMessages();
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    try {
      await fetch(`/api/v1/protected/messages/${messageId}/reactions/${emoji}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      loadMessages();
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      author: { username: message.author.username }
    });
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        currentUserId={user.id}
        onEditMessage={editMessage}
        onDeleteMessage={deleteMessage}
        onReplyToMessage={handleReplyToMessage}
        onAddReaction={addReaction}
        onRemoveReaction={removeReaction}
        loading={loading}
        typingUsers={typingUsers}
      />
      
      <MessageInput
        channelId={channelId}
        replyTo={replyTo}
        onSendMessage={sendMessage}
        onClearReply={() => setReplyTo(undefined)}
      />
    </div>
  );
};