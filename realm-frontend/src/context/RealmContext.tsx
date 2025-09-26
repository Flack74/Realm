import React, { createContext, useContext, useState, useEffect } from 'react';
import { realmService } from '../services/api';

interface Realm {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  owner_id: string;
  invite_code: string;
  created_at: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  category?: string;
  nsfw?: boolean;
  locked?: boolean;
  unread?: number;
}

interface RealmContextType {
  realms: Realm[];
  selectedRealm: Realm | null;
  selectedChannel: Channel | null;
  directMessages: boolean;
  memberListVisible: boolean;
  selectRealm: (realm: Realm) => void;
  selectChannel: (channel: Channel) => void;
  selectDirectMessages: () => void;
  toggleMemberList: () => void;
  createRealm: (name: string, description?: string) => Promise<void>;
  joinRealm: (inviteCode: string) => Promise<void>;
  leaveRealm: (realmId: string) => Promise<void>;
  loading: boolean;
}

const RealmContext = createContext<RealmContextType | undefined>(undefined);

export const useRealm = () => {
  const context = useContext(RealmContext);
  if (!context) {
    throw new Error('useRealm must be used within a RealmProvider');
  }
  return context;
};

export const RealmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [realms, setRealms] = useState<Realm[]>([]);
  const [selectedRealm, setSelectedRealm] = useState<Realm | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [directMessages, setDirectMessages] = useState(false);
  const [memberListVisible, setMemberListVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealms();
  }, []);

  const loadRealms = async () => {
    try {
      const userRealms = await realmService.getUserRealms();
      setRealms(userRealms);
    } catch (error) {
      console.error('Failed to load realms:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRealm = (realm: Realm) => {
    setSelectedRealm(realm);
    setSelectedChannel(null);
    setDirectMessages(false);
  };

  const selectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const selectDirectMessages = () => {
    setDirectMessages(true);
    setSelectedRealm(null);
    setSelectedChannel(null);
  };

  const toggleMemberList = () => {
    setMemberListVisible(!memberListVisible);
  };

  const createRealm = async (name: string, description?: string) => {
    try {
      const newRealm = await realmService.createRealm(name, description);
      setRealms([...realms, newRealm]);
      setSelectedRealm(newRealm);
    } catch (error) {
      console.error('Failed to create realm:', error);
      throw error;
    }
  };

  const joinRealm = async (inviteCode: string) => {
    try {
      await realmService.joinRealm(inviteCode);
      await loadRealms(); // Refresh realms list
    } catch (error) {
      console.error('Failed to join realm:', error);
      throw error;
    }
  };

  const leaveRealm = async (realmId: string) => {
    try {
      await realmService.leaveRealm(realmId);
      setRealms(realms.filter(r => r.id !== realmId));
      if (selectedRealm?.id === realmId) {
        setSelectedRealm(null);
        setSelectedChannel(null);
      }
    } catch (error) {
      console.error('Failed to leave realm:', error);
      throw error;
    }
  };

  return (
    <RealmContext.Provider value={{
      realms,
      selectedRealm,
      selectedChannel,
      directMessages,
      memberListVisible,
      selectRealm,
      selectChannel,
      selectDirectMessages,
      toggleMemberList,
      createRealm,
      joinRealm,
      leaveRealm,
      loading
    }}>
      {children}
    </RealmContext.Provider>
  );
};