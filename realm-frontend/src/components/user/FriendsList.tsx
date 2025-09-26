import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Friend {
  id: string;
  user: {
    id: string;
    username: string;
    display_name?: string;
    status: string;
    activity?: string;
  };
}

export const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [newFriend, setNewFriend] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await fetch('/api/v1/protected/friends', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/v1/protected/friends/requests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!newFriend.trim()) return;

    try {
      const response = await fetch('/api/v1/protected/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username: newFriend.trim() })
      });

      if (response.ok) {
        toast.success('Friend request sent');
        setNewFriend('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send friend request');
      }
    } catch (error) {
      toast.error('Failed to send friend request');
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/v1/protected/friends/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        toast.success('Friend request accepted');
        loadFriends();
        loadRequests();
      } else {
        toast.error('Failed to accept friend request');
      }
    } catch (error) {
      toast.error('Failed to accept friend request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Friends</h2>
        <Users className="w-5 h-5 text-gray-400" />
      </div>

      {/* Add Friend */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            placeholder="Enter username"
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyPress={(e) => e.key === 'Enter' && sendFriendRequest()}
          />
          <button
            onClick={sendFriendRequest}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'friends' 
              ? 'text-white border-b-2 border-indigo-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'requests' 
              ? 'text-white border-b-2 border-indigo-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Requests ({requests.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activeTab === 'friends' ? (
          friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-700">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold">
                      {friend.user.display_name?.charAt(0) || friend.user.username.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(friend.user.status)}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {friend.user.display_name || friend.user.username}
                    </div>
                    {friend.user.activity && (
                      <div className="text-xs text-gray-400">{friend.user.activity}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No friends yet</p>
          )
        ) : (
          requests.length > 0 ? (
            requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                    {request.user.display_name?.charAt(0) || request.user.username.charAt(0)}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {request.user.display_name || request.user.username}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => acceptRequest(request.id)}
                    className="p-1 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-red-400 hover:text-red-300 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No pending requests</p>
          )
        )}
      </div>
    </div>
  );
};