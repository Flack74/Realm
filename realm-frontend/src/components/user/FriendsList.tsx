import React, { useState } from 'react';
import { UserPlus, MessageCircle, MoreHorizontal, Check, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface Friend {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  activity?: string;
}

interface FriendRequest {
  id: string;
  user: Friend;
  type: 'incoming' | 'outgoing';
  timestamp: Date;
}

export const FriendsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'online' | 'all' | 'pending' | 'blocked'>('online');

  const friends: Friend[] = [
    {
      id: '1',
      username: 'gamer123',
      displayName: 'Alex',
      status: 'online',
      activity: 'Playing Valorant'
    },
    {
      id: '2',
      username: 'developer',
      status: 'idle',
      activity: 'Visual Studio Code'
    },
    {
      id: '3',
      username: 'designer',
      status: 'dnd'
    },
    {
      id: '4',
      username: 'offline_user',
      status: 'offline'
    }
  ];

  const friendRequests: FriendRequest[] = [
    {
      id: '1',
      user: {
        id: '5',
        username: 'newuser',
        status: 'online'
      },
      type: 'incoming',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      user: {
        id: '6',
        username: 'pending_friend',
        status: 'offline'
      },
      type: 'outgoing',
      timestamp: new Date(Date.now() - 7200000)
    }
  ];

  const filteredFriends = friends.filter(friend => {
    if (activeTab === 'online') return friend.status !== 'offline';
    return true;
  });

  const tabs = [
    { id: 'online', label: 'Online', count: friends.filter(f => f.status !== 'offline').length },
    { id: 'all', label: 'All', count: friends.length },
    { id: 'pending', label: 'Pending', count: friendRequests.length },
    { id: 'blocked', label: 'Blocked', count: 0 }
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {/* Header */}
      <div className="h-12 px-6 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <UserPlus size={20} className="text-gray-400" />
          <span className="font-semibold text-white">Friends</span>
        </div>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          Add Friend
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 bg-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'pending' ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">
              Friend Requests — {friendRequests.length}
            </h3>
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={request.user.avatar}
                    alt={request.user.username}
                    fallback={request.user.username}
                    status={request.user.status}
                  />
                  <div>
                    <div className="font-medium text-white">
                      {request.user.displayName || request.user.username}
                    </div>
                    <div className="text-sm text-gray-400">
                      {request.type === 'incoming' ? 'Incoming Friend Request' : 'Outgoing Friend Request'}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {request.type === 'incoming' ? (
                    <>
                      <Button size="sm" variant="success">
                        <Check size={16} />
                      </Button>
                      <Button size="sm" variant="danger">
                        <X size={16} />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="secondary">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">
              {activeTab === 'online' ? 'Online' : 'All Friends'} — {filteredFriends.length}
            </h3>
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-4 hover:bg-gray-700 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={friend.avatar}
                    alt={friend.username}
                    fallback={friend.username}
                    status={friend.status}
                  />
                  <div>
                    <div className="font-medium text-white">
                      {friend.displayName || friend.username}
                    </div>
                    {friend.activity && (
                      <div className="text-sm text-gray-400">
                        {friend.activity}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost">
                    <MessageCircle size={16} />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};