import React, { useState } from 'react';
import { ServerSidebar } from './ServerSidebar';
import { ChannelSidebar } from './ChannelSidebar';
import { MainContent } from './MainContent';
import { MemberSidebar } from './MemberSidebar';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [selectedRealm, setSelectedRealm] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showMemberSidebar, setShowMemberSidebar] = useState(true);

  return (
    <div className="flex h-screen bg-gray-800 text-gray-100 font-sans">
      <ServerSidebar 
        selectedRealm={selectedRealm}
        onRealmSelect={setSelectedRealm}
      />
      
      {selectedRealm && (
        <ChannelSidebar 
          realmId={selectedRealm}
          selectedChannel={selectedChannel}
          onChannelSelect={setSelectedChannel}
        />
      )}
      
      <MainContent 
        channelId={selectedChannel}
        onToggleMemberSidebar={() => setShowMemberSidebar(!showMemberSidebar)}
      />
      
      {selectedChannel && showMemberSidebar && (
        <MemberSidebar 
          channelId={selectedChannel}
          onClose={() => setShowMemberSidebar(false)}
        />
      )}
    </div>
  );
};