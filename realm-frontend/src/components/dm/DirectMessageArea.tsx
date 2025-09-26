import React, { useState, useEffect } from 'react';
import { Send, Phone, Video, Settings } from 'lucide-react';

interface DirectMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    display_name?: string;
  };
  recipient?: {
    id: string;
    username: string;
    display_name?: string;
  };
  created_at: string;
  edited_at?: string;
}

interface DirectMessageAreaProps {
  userId: string;
  user: {
    id: string;
    username: string;
    display_name?: string;
    status: string;
  };
}

export const DirectMessageArea: React.FC<DirectMessageAreaProps> = ({ userId, user }) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadMessages();
  }, [userId]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/v1/protected/dm/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/v1/protected/dm/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        const message = await response.json();
        setMessages([...messages, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center">
          <div className="relative mr-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold">
              {(user.display_name || user.username).charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-gray-800`} />
          </div>
          <div>
            <h2 className="font-semibold text-white">{user.display_name || user.username}</h2>
            <p className="text-xs text-gray-400 capitalize">{user.status}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-semibold">
              {(user.display_name || user.username).charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {user.display_name || user.username}
            </h3>
            <p className="text-gray-400">Start of your conversation.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold">
                {(message.sender.display_name || message.sender.username).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="font-semibold text-white">
                    {message.sender.display_name || message.sender.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                <div className="text-gray-300">{message.content}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4">
        <div className="flex items-end space-x-3 bg-gray-700 rounded-lg p-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message @${user.username}`}
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none"
            rows={1}
          />
          {newMessage.trim() && (
            <button
              onClick={sendMessage}
              className="p-1 text-indigo-400 hover:text-indigo-300"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};