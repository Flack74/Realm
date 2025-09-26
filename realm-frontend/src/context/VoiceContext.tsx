import React, { createContext, useContext, ReactNode } from 'react';
import { useVoiceChat } from '../hooks/useVoiceChat';

interface VoiceContextType {
  voiceState: any;
  joinVoiceChannel: (channelId: string) => Promise<void>;
  leaveVoiceChannel: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleDeafen: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  pushToTalk: boolean;
  setPushToTalk: (enabled: boolean) => void;
  isKeyPressed: boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

interface VoiceProviderProps {
  children: ReactNode;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ children }) => {
  const voiceChat = useVoiceChat();

  return (
    <VoiceContext.Provider value={voiceChat}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceContext = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoiceContext must be used within a VoiceProvider');
  }
  return context;
};