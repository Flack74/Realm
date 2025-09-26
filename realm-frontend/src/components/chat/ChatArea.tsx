import React, { useState, useEffect, useRef } from 'react';
import { Hash, Users, Pin, Search, Bell, HelpCircle, Smile, Paperclip, Send } from 'lucide-react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatAreaProps {
  channelId: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ channelId }) => {
  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    loadChannel();
    loadMessages();
  }, [channelId]);

  const loadChannel = async () => {
    try {
      const response = await fetch(`/api/v1/protected/channels/${channelId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChannel(data);
      }
    } catch (error) {
      console.error('Failed to load channel:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/v1/protected/channels/${channelId}/messages`, {
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

  const handleSendMessage = async (content: string) => {
    try {
      const response = await fetch(`/api/v1/protected/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });
      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Hash className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-semibold text-white">{channel?.name || 'Channel'}</span>
          {channel?.topic && (
            <>
              <div className="w-px h-6 bg-gray-600 mx-3" />
              <span className="text-sm text-gray-400">{channel.topic}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <Pin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <Users className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center bg-gray-900 rounded px-2 py-1">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none w-32"
            />
          </div>
          <HelpCircle className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Messages Area */}
      <MessageList messages={messages} channelId={channelId} onMessagesUpdate={setMessages} />

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} channelName={channel?.name} />
    </div>
  );
};