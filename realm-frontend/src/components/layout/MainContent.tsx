import React from 'react';
import { Hash, Users, Pin, Search, Inbox, HelpCircle } from 'lucide-react';
import { MessageList } from '../chat/MessageList';
import { MessageInput } from '../chat/MessageInput';

interface MainContentProps {
  channelId: string | null;
  onToggleMemberSidebar: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  channelId,
  onToggleMemberSidebar
}) => {
  if (!channelId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-800">
        <div className="text-center text-gray-400">
          <Hash size={48} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Select a channel</h2>
          <p>Choose a channel from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {/* Channel Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-700 bg-gray-800">
        <div className="flex items-center">
          <Hash size={20} className="text-gray-400 mr-2" />
          <span className="font-semibold text-white">general</span>
          <div className="w-px h-6 bg-gray-600 mx-3" />
          <span className="text-sm text-gray-400">General discussion channel</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white">
            <Pin size={20} />
          </button>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={onToggleMemberSidebar}
          >
            <Users size={20} />
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="bg-gray-900 text-white placeholder-gray-400 pl-9 pr-3 py-1 rounded text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="text-gray-400 hover:text-white">
            <Inbox size={20} />
          </button>
          <button className="text-gray-400 hover:text-white">
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList channelId={channelId} />
        <MessageInput channelId={channelId} />
      </div>
    </div>
  );
};