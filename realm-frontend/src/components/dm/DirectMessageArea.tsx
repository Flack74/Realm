import React, { useState } from 'react';
import { FriendsList } from '../user/FriendsList';
import { useAuth } from '../../context/AuthContext';

interface Friend {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  last_message?: {
    content: string;
    timestamp: Date;
  };
}

export const DirectMessageArea: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-full">
      <FriendsList currentUserId={user.id} />
      
      {/* Chat Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-700">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-300">
            Select a conversation
          </h2>
          <p className="text-gray-400">
            Choose a friend to start messaging
          </p>
        </div>
      </div>
    </div>
  );
};