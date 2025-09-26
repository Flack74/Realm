import React, { useState } from 'react';
import { Hash, Volume2, Settings, UserPlus, ChevronDown, ChevronRight } from 'lucide-react';

interface ChannelSidebarProps {
  realmId: string;
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  realmId,
  selectedChannel,
  onChannelSelect
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['text', 'voice']));

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const textChannels = [
    { id: 'general', name: 'general', unread: 0 },
    { id: 'random', name: 'random', unread: 3 },
    { id: 'announcements', name: 'announcements', unread: 0 }
  ];

  const voiceChannels = [
    { id: 'general-voice', name: 'General', users: 2 },
    { id: 'gaming', name: 'Gaming', users: 0 },
    { id: 'music', name: 'Music', users: 1 }
  ];

  return (
    <div className="w-60 bg-gray-700 flex flex-col">
      {/* Realm Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-600 shadow-sm">
        <h1 className="font-semibold text-white">Realm Name</h1>
        <button className="text-gray-400 hover:text-white">
          <Settings size={16} />
        </button>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Text Channels */}
        <div className="mb-4">
          <button
            className="flex items-center w-full text-xs font-semibold text-gray-400 hover:text-gray-300 mb-1 px-1"
            onClick={() => toggleCategory('text')}
          >
            {expandedCategories.has('text') ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span className="ml-1">TEXT CHANNELS</span>
          </button>
          
          {expandedCategories.has('text') && textChannels.map((channel) => (
            <button
              key={channel.id}
              className={`flex items-center w-full px-2 py-1 rounded text-sm transition-colors ${
                selectedChannel === channel.id
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600 hover:text-gray-100'
              }`}
              onClick={() => onChannelSelect(channel.id)}
            >
              <Hash size={16} className="mr-2 text-gray-400" />
              <span className="flex-1 text-left">{channel.name}</span>
              {channel.unread > 0 && (
                <span className="bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {channel.unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Voice Channels */}
        <div className="mb-4">
          <button
            className="flex items-center w-full text-xs font-semibold text-gray-400 hover:text-gray-300 mb-1 px-1"
            onClick={() => toggleCategory('voice')}
          >
            {expandedCategories.has('voice') ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span className="ml-1">VOICE CHANNELS</span>
          </button>
          
          {expandedCategories.has('voice') && voiceChannels.map((channel) => (
            <button
              key={channel.id}
              className={`flex items-center w-full px-2 py-1 rounded text-sm transition-colors ${
                selectedChannel === channel.id
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600 hover:text-gray-100'
              }`}
              onClick={() => onChannelSelect(channel.id)}
            >
              <Volume2 size={16} className="mr-2 text-gray-400" />
              <span className="flex-1 text-left">{channel.name}</span>
              {channel.users > 0 && (
                <span className="text-xs text-gray-400">{channel.users}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* User Panel */}
      <div className="h-14 bg-gray-800 px-2 flex items-center">
        <div className="flex items-center flex-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
            U
          </div>
          <div className="ml-2 flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">Username</div>
            <div className="text-xs text-gray-400 truncate">Online</div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white ml-2">
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
};