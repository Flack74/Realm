import React from 'react';
import { Crown, Shield, X } from 'lucide-react';

interface MemberSidebarProps {
  channelId: string;
  onClose: () => void;
}

interface Member {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  roles: string[];
  isOwner?: boolean;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  channelId,
  onClose
}) => {
  const members: Member[] = [
    {
      id: '1',
      username: 'admin',
      displayName: 'Server Admin',
      status: 'online',
      roles: ['Admin'],
      isOwner: true
    },
    {
      id: '2',
      username: 'moderator',
      status: 'idle',
      roles: ['Moderator']
    },
    {
      id: '3',
      username: 'user1',
      status: 'online',
      roles: []
    },
    {
      id: '4',
      username: 'user2',
      status: 'dnd',
      roles: []
    },
    {
      id: '5',
      username: 'user3',
      status: 'offline',
      roles: []
    }
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

  const groupedMembers = members.reduce((acc, member) => {
    const role = member.roles[0] || 'Members';
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  return (
    <div className="w-60 bg-gray-700 flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-600">
        <span className="font-semibold text-white">Members</span>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedMembers).map(([role, roleMembers]) => (
          <div key={role} className="mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
              {role} — {roleMembers.length}
            </div>
            
            {roleMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center px-2 py-1 rounded hover:bg-gray-600 cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {member.avatar ? (
                      <img src={member.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      member.username[0].toUpperCase()
                    )}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-700 ${getStatusColor(member.status)}`} />
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white truncate">
                      {member.displayName || member.username}
                    </span>
                    {member.isOwner && (
                      <Crown size={12} className="ml-1 text-yellow-500" />
                    )}
                    {member.roles.includes('Moderator') && (
                      <Shield size={12} className="ml-1 text-blue-500" />
                    )}
                  </div>
                  {member.displayName && (
                    <div className="text-xs text-gray-400 truncate">
                      {member.username}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};