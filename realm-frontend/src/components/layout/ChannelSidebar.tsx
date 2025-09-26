import React, { useState, useEffect } from 'react';
import { ChevronDown, Hash, Volume2, Settings, UserPlus, Plus, Lock } from 'lucide-react';
import { StatusSelector } from '../user/StatusSelector';
import { UserSettingsModal } from '../modals/UserSettingsModal';
import { CreateChannelModal } from '../modals/CreateChannelModal';
import { RealmSettingsModal } from '../modals/RealmSettingsModal';
import { VoiceChannel } from '../voice/VoiceChannel';
import { useRealm } from '../../context/RealmContext';
import { useAuth } from '../../context/AuthContext';
import { channelService } from '../../services/api';

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  category?: string;
  nsfw?: boolean;
  locked?: boolean;
  unread?: number;
}

export const ChannelSidebar: React.FC = () => {
  const { selectedRealm, selectedChannel, selectChannel, directMessages } = useRealm();
  const { user } = useAuth();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showRealmSettings, setShowRealmSettings] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    if (selectedRealm) {
      loadChannels();
    }
  }, [selectedRealm]);

  const loadChannels = async () => {
    if (!selectedRealm) return;
    try {
      const data = await channelService.getRealmChannels(selectedRealm.id);
      setChannels(data);
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const groupedChannels = channels.reduce((acc, channel) => {
    const category = channel.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  if (directMessages) {
    return (
      <div className="w-60 bg-gray-800 flex flex-col">
        {/* DM Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-semibold text-white">Direct Messages</h2>
        </div>
        
        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-2">
            Friends
          </div>
          {/* Mock friends - replace with real data */}
          <div className="space-y-1">
            <div className="flex items-center px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                J
              </div>
              <span className="text-gray-300">John Doe</span>
              <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedRealm) {
    return (
      <div className="w-60 bg-gray-800 flex items-center justify-center">
        <p className="text-gray-400">Select a realm to view channels</p>
      </div>
    );
  }

  return (
    <div className="w-60 bg-gray-800 flex flex-col">
      {/* Realm Header */}
      <div 
        className="p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={() => setShowRealmSettings(true)}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white truncate">{selectedRealm.name}</h2>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedChannels).map(([category, categoryChannels]) => (
          <div key={category} className="mb-4">
            {/* Category Header */}
            <div
              onClick={() => toggleCategory(category)}
              className="flex items-center justify-between px-2 py-1 cursor-pointer hover:text-gray-300 transition-colors"
            >
              <div className="flex items-center">
                <ChevronDown 
                  className={`w-3 h-3 mr-1 transition-transform ${
                    collapsedCategories.has(category) ? '-rotate-90' : ''
                  }`} 
                />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {category}
                </span>
              </div>
              <Plus 
                className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateChannel(true);
                }}
              />
            </div>

            {/* Channels in Category */}
            {!collapsedCategories.has(category) && (
              <div className="space-y-0.5 ml-2">
                {categoryChannels.map((channel) => (
                  channel.type === 'voice' ? (
                    <VoiceChannel key={channel.id} channel={channel} />
                  ) : (
                    <div
                      key={channel.id}
                      onClick={() => selectChannel(channel)}
                      className={`flex items-center px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedChannel?.id === channel.id
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                      }`}
                    >
                      <Hash className="w-4 h-4 mr-2" />
                      <span className="flex-1 truncate">{channel.name}</span>
                      
                      {/* Channel Indicators */}
                      <div className="flex items-center space-x-1">
                        {channel.locked && <Lock className="w-3 h-3" />}
                        {channel.unread && (
                          <div className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                            {channel.unread}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Area */}
      <div className="p-2 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold mr-2">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user?.display_name || user?.username || 'User'}
              </div>
              <StatusSelector 
                currentStatus={user?.status || 'online'} 
                onStatusChange={(status) => {
                  // Update user status in context
                  console.log('Status changed to:', status);
                }} 
              />
            </div>
          </div>
          <div className="flex space-x-1">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
      
      {/* User Settings Modal */}
      {showSettings && (
        <UserSettingsModal onClose={() => setShowSettings(false)} />
      )}
      
      {/* Create Channel Modal */}
      {showCreateChannel && selectedRealm && (
        <CreateChannelModal 
          realmId={selectedRealm.id}
          onClose={() => setShowCreateChannel(false)}
          onChannelCreated={loadChannels}
        />
      )}
      
      {/* Realm Settings Modal */}
      {showRealmSettings && selectedRealm && (
        <RealmSettingsModal 
          realm={selectedRealm}
          onClose={() => setShowRealmSettings(false)}
          onRealmUpdated={() => {}}
        />
      )}
    </div>
  );
};