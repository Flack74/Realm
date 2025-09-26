import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { RealmSidebar } from './RealmSidebar';
import { ChatArea } from '../message/ChatArea';
import { useWebSocket } from '../../hooks/useWebSocket';

export const RealmApp: React.FC = () => {
  const { realmId, channelId } = useParams();
  const [selectedRealmId, setSelectedRealmId] = useState<string>(realmId || '');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channelId || '');
  
  const { connected, joinRealm, joinChannel } = useWebSocket();

  const handleRealmSelect = (newRealmId: string) => {
    setSelectedRealmId(newRealmId);
    joinRealm(newRealmId);
  };

  const handleChannelSelect = (newChannelId: string) => {
    setSelectedChannelId(newChannelId);
    joinChannel(newChannelId);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <RealmSidebar
        selectedRealmId={selectedRealmId}
        selectedChannelId={selectedChannelId}
        onRealmSelect={handleRealmSelect}
        onChannelSelect={handleChannelSelect}
      />
      
      <div className="flex-1 flex flex-col">

        
        {selectedChannelId ? (
          <ChatArea channelId={selectedChannelId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Welcome to Realm</h2>
              <p>Select a channel to start communicating</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};