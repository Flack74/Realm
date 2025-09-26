import React from 'react';
import { Crown, Shield, User } from 'lucide-react';

interface Member {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  role?: 'owner' | 'admin' | 'moderator' | 'member';
  activity?: string;
}

export const MemberList: React.FC = () => {
  // Mock data - replace with real data from context
  const members: Member[] = [
    { id: '1', username: 'RealmOwner', status: 'online', role: 'owner', activity: 'Playing Minecraft' },
    { id: '2', username: 'AdminUser', status: 'online', role: 'admin' },
    { id: '3', username: 'ModeratorUser', status: 'idle', role: 'moderator' },
    { id: '4', username: 'ActiveUser', status: 'online', role: 'member', activity: 'Listening to Spotify' },
    { id: '5', username: 'IdleUser', status: 'idle', role: 'member' },
    { id: '6', username: 'BusyUser', status: 'dnd', role: 'member' },
    { id: '7', username: 'OfflineUser', status: 'offline', role: 'member' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'admin': return <Shield className="w-3 h-3 text-red-500" />;
      case 'moderator': return <Shield className="w-3 h-3 text-blue-500" />;
      default: return null;
    }
  };

  const groupedMembers = members.reduce((acc, member) => {
    const category = member.status === 'offline' ? 'Offline' : 'Online';
    if (!acc[category]) acc[category] = [];
    acc[category].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  return (
    <div className="w-60 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Members — {members.length}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedMembers).map(([category, categoryMembers]) => (
          <div key={category} className="mb-4">
            <div className="px-2 py-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {category} — {categoryMembers.length}
              </span>
            </div>

            <div className="space-y-1">
              {categoryMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center px-2 py-1 rounded hover:bg-gray-700 cursor-pointer transition-colors group"
                >
                  <div className="relative mr-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        member.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(member.status)}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      {getRoleIcon(member.role)}
                      <span className={`text-sm font-medium truncate ml-1 ${
                        member.status === 'offline' ? 'text-gray-500' : 'text-gray-300'
                      }`}>
                        {member.username}
                      </span>
                    </div>
                    {member.activity && member.status !== 'offline' && (
                      <div className="text-xs text-gray-400 truncate">
                        {member.activity}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};