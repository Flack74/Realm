import React from 'react';
import { RealmSidebar } from './RealmSidebar';
import { ChannelSidebar } from './ChannelSidebar';
import { ChatArea } from '../chat/ChatArea';
import { MemberList } from './MemberList';
import { VoiceControls } from '../voice/VoiceControls';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { DirectMessageArea } from '../dm/DirectMessageArea';
import { useAuth } from '../../context/AuthContext';
import { useRealm } from '../../context/RealmContext';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const { selectedRealm, selectedChannel, memberListVisible, directMessages } = useRealm();

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Realm Sidebar */}
      <RealmSidebar />
      
      {/* Channel Sidebar */}
      <ChannelSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Notification Center */}
        <div className="absolute top-4 right-4 z-10">
          <NotificationCenter />
        </div>
        
        {directMessages ? (
          <DirectMessageArea 
            userId="mock-user-id" 
            user={{
              id: "mock-user-id",
              username: "friend",
              display_name: "Friend User",
              status: "online"
            }} 
          />
        ) : selectedChannel ? (
          <ChatArea channelId={selectedChannel.id} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-300">
                {selectedRealm ? `Welcome to ${selectedRealm.name}` : 'Welcome to Realm'}
              </h2>
              <p className="text-gray-400">
                {selectedRealm ? 'Select a channel to start chatting' : 'Select a realm to get started'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Member List */}
      {memberListVisible && selectedChannel && (
        <MemberList />
      )}
      
      {/* Voice Controls */}
      <VoiceControls />
    </div>
  );
};