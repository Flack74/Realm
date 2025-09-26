import React, { useEffect, useState } from 'react';
import { realmService } from '../../services/api';
import { PlusIcon, HashtagIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

interface Realm {
  id: string;
  name: string;
  icon_url?: string;
  channels?: Channel[];
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
}

interface RealmSidebarProps {
  selectedRealmId?: string;
  selectedChannelId?: string;
  onRealmSelect: (realmId: string) => void;
  onChannelSelect: (channelId: string) => void;
}

export const RealmSidebar: React.FC<RealmSidebarProps> = ({
  selectedRealmId,
  selectedChannelId,
  onRealmSelect,
  onChannelSelect
}) => {
  const [realms, setRealms] = useState<Realm[]>([]);
  const [selectedRealm, setSelectedRealm] = useState<Realm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealms();
  }, []);

  useEffect(() => {
    if (selectedRealmId && realms.length > 0) {
      const realm = realms.find(r => r.id === selectedRealmId);
      if (realm) {
        setSelectedRealm(realm);
      }
    }
  }, [selectedRealmId, realms]);

  const loadRealms = async () => {
    try {
      const userRealms = await realmService.getUserRealms();
      setRealms(userRealms);
      if (userRealms.length > 0 && !selectedRealmId) {
        onRealmSelect(userRealms[0].id);
      }
    } catch (error) {
      console.error('Failed to load realms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRealmClick = (realm: Realm) => {
    setSelectedRealm(realm);
    onRealmSelect(realm.id);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-16 bg-gray-900 flex flex-col items-center py-3">
          <div className="animate-pulse bg-gray-700 rounded-full w-12 h-12 mb-2"></div>
        </div>
        <div className="w-60 bg-gray-800 p-3">
          <div className="animate-pulse bg-gray-700 h-6 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Realm List */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-3 space-y-2">
        {realms.map((realm) => (
          <button
            key={realm.id}
            onClick={() => handleRealmClick(realm)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-200 ${
              selectedRealmId === realm.id
                ? 'bg-indigo-600 rounded-2xl'
                : 'bg-gray-700 hover:bg-indigo-600 hover:rounded-2xl'
            }`}
          >
            {realm.icon_url ? (
              <img src={realm.icon_url} alt={realm.name} className="w-full h-full rounded-full" />
            ) : (
              realm.name.charAt(0).toUpperCase()
            )}
          </button>
        ))}
        
        <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-green-600 hover:rounded-2xl flex items-center justify-center text-green-400 hover:text-white transition-all duration-200">
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Channel List */}
      <div className="w-60 bg-gray-800 flex flex-col">
        {selectedRealm && (
          <>
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-white font-semibold text-lg">{selectedRealm.name}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <div className="mb-4">
                <div className="flex items-center justify-between px-2 py-1 text-gray-400 text-xs font-semibold uppercase tracking-wide">
                  <span>Text Channels</span>
                  <PlusIcon className="w-4 h-4 hover:text-white cursor-pointer" />
                </div>
                
                {selectedRealm.channels?.filter(c => c.type === 'text').map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => onChannelSelect(channel.id)}
                    className={`w-full flex items-center px-2 py-1 rounded text-left transition-colors ${
                      selectedChannelId === channel.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <HashtagIcon className="w-4 h-4 mr-2" />
                    {channel.name}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between px-2 py-1 text-gray-400 text-xs font-semibold uppercase tracking-wide">
                  <span>Voice Channels</span>
                  <PlusIcon className="w-4 h-4 hover:text-white cursor-pointer" />
                </div>
                
                {selectedRealm.channels?.filter(c => c.type === 'voice').map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => onChannelSelect(channel.id)}
                    className={`w-full flex items-center px-2 py-1 rounded text-left transition-colors ${
                      selectedChannelId === channel.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <SpeakerWaveIcon className="w-4 h-4 mr-2" />
                    {channel.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};