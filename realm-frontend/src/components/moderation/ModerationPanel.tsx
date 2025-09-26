import React, { useState } from 'react';
import { Shield, Ban, UserX, Clock, Search, Filter, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface ModerationAction {
  id: string;
  type: 'kick' | 'ban' | 'timeout' | 'warn' | 'unban';
  target: {
    id: string;
    username: string;
    avatar?: string;
  };
  moderator: {
    id: string;
    username: string;
  };
  reason: string;
  timestamp: Date;
  duration?: number;
  active: boolean;
}

interface Member {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  joinedAt: Date;
  roles: string[];
  status: 'online' | 'idle' | 'dnd' | 'offline';
  warningCount: number;
  lastActive: Date;
}

export const ModerationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'actions' | 'bans'>('members');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionType, setActionType] = useState<'kick' | 'ban' | 'timeout' | 'warn'>('kick');
  const [searchTerm, setSearchTerm] = useState('');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('60');

  const members: Member[] = [
    {
      id: '1',
      username: 'troublemaker',
      status: 'online',
      joinedAt: new Date(Date.now() - 86400000),
      roles: ['Member'],
      warningCount: 2,
      lastActive: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      username: 'spammer',
      status: 'idle',
      joinedAt: new Date(Date.now() - 172800000),
      roles: ['Member'],
      warningCount: 1,
      lastActive: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      username: 'gooduser',
      status: 'online',
      joinedAt: new Date(Date.now() - 604800000),
      roles: ['Member', 'Trusted'],
      warningCount: 0,
      lastActive: new Date(Date.now() - 300000)
    }
  ];

  const moderationActions: ModerationAction[] = [
    {
      id: '1',
      type: 'ban',
      target: { id: '4', username: 'banned_user' },
      moderator: { id: 'mod1', username: 'moderator' },
      reason: 'Spam and harassment',
      timestamp: new Date(Date.now() - 3600000),
      active: true
    },
    {
      id: '2',
      type: 'timeout',
      target: { id: '5', username: 'timeout_user' },
      moderator: { id: 'mod1', username: 'moderator' },
      reason: 'Inappropriate language',
      timestamp: new Date(Date.now() - 7200000),
      duration: 60,
      active: false
    },
    {
      id: '3',
      type: 'kick',
      target: { id: '6', username: 'kicked_user' },
      moderator: { id: 'mod2', username: 'admin' },
      reason: 'Rule violation',
      timestamp: new Date(Date.now() - 10800000),
      active: false
    },
    {
      id: '4',
      type: 'warn',
      target: { id: '1', username: 'troublemaker' },
      moderator: { id: 'mod1', username: 'moderator' },
      reason: 'Minor rule violation',
      timestamp: new Date(Date.now() - 14400000),
      active: true
    }
  ];

  const bannedUsers = [
    {
      id: '4',
      username: 'banned_user',
      bannedAt: new Date(Date.now() - 3600000),
      bannedBy: 'moderator',
      reason: 'Spam and harassment'
    }
  ];

  const handleModerationAction = (member: Member, action: 'kick' | 'ban' | 'timeout' | 'warn') => {
    setSelectedMember(member);
    setActionType(action);
    setReason('');
    setDuration('60');
    setShowActionModal(true);
  };

  const handleExecuteAction = () => {
    if (!selectedMember || !reason.trim()) return;

    console.log(`Executing ${actionType} on ${selectedMember.username}:`, {
      reason,
      duration: actionType === 'timeout' ? parseInt(duration) : undefined
    });

    setShowActionModal(false);
    setSelectedMember(null);
    setReason('');
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ban': return <Ban size={16} className="text-red-500" />;
      case 'kick': return <UserX size={16} className="text-orange-500" />;
      case 'timeout': return <Clock size={16} className="text-yellow-500" />;
      case 'warn': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'unban': return <Eye size={16} className="text-green-500" />;
      default: return <Shield size={16} className="text-gray-500" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'ban': return 'danger';
      case 'kick': return 'warning';
      case 'timeout': return 'warning';
      case 'warn': return 'warning';
      case 'unban': return 'success';
      default: return 'default';
    }
  };

  const filteredMembers = members.filter(member =>
    member.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Shield className="mr-3" />
          Moderation
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 text-white placeholder-gray-400 pl-9 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button variant="ghost">
            <Filter size={16} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-6 border-b border-gray-700">
        {[
          { id: 'members', label: 'Members', count: members.length },
          { id: 'actions', label: 'Audit Log', count: moderationActions.length },
          { id: 'bans', label: 'Bans', count: bannedUsers.length }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge variant="default" className="ml-2">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={member.avatar}
                  alt={member.username}
                  fallback={member.username}
                  status={member.status}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">
                      {member.displayName || member.username}
                    </span>
                    {member.warningCount > 0 && (
                      <Badge variant="warning" size="sm">
                        {member.warningCount} warnings
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    Joined {member.joinedAt.toLocaleDateString()} • 
                    Last active {member.lastActive.toLocaleString()}
                  </div>
                  <div className="flex space-x-1 mt-1">
                    {member.roles.map((role) => (
                      <Badge key={role} variant="default" size="sm">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleModerationAction(member, 'warn')}
                >
                  <AlertTriangle size={16} className="mr-1" />
                  Warn
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleModerationAction(member, 'timeout')}
                >
                  <Clock size={16} className="mr-1" />
                  Timeout
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleModerationAction(member, 'kick')}
                >
                  <UserX size={16} className="mr-1" />
                  Kick
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleModerationAction(member, 'ban')}
                >
                  <Ban size={16} className="mr-1" />
                  Ban
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-4">
          {moderationActions.map((action) => (
            <div key={action.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                {getActionIcon(action.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant={getActionColor(action.type) as any} size="sm">
                      {action.type.toUpperCase()}
                    </Badge>
                    <span className="text-white font-medium">{action.target.username}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {action.timestamp.toLocaleString()}
                    </span>
                    {action.active && (
                      <Badge variant="success" size="sm">Active</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    <strong>Reason:</strong> {action.reason}
                  </div>
                  <div className="text-xs text-gray-400">
                    By {action.moderator.username}
                    {action.duration && ` • Duration: ${action.duration} minutes`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bans' && (
        <div className="space-y-4">
          {bannedUsers.length > 0 ? (
            bannedUsers.map((user) => (
              <div key={user.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{user.username}</div>
                  <div className="text-sm text-gray-400">
                    Banned {user.bannedAt.toLocaleString()} by {user.bannedBy}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    <strong>Reason:</strong> {user.reason}
                  </div>
                </div>
                <Button size="sm" variant="success">
                  Unban
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Ban size={48} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No banned users</h3>
              <p className="text-gray-500">Banned users will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Moderation Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Member`}
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded">
              <Avatar
                src={selectedMember.avatar}
                alt={selectedMember.username}
                fallback={selectedMember.username}
              />
              <div>
                <div className="font-medium text-white">{selectedMember.username}</div>
                <div className="text-sm text-gray-400">
                  Member since {selectedMember.joinedAt.toLocaleDateString()}
                </div>
                {selectedMember.warningCount > 0 && (
                  <Badge variant="warning" size="sm" className="mt-1">
                    {selectedMember.warningCount} previous warnings
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder={`Enter reason for ${actionType}...`}
                required
              />
            </div>

            {actionType === 'timeout' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration
                </label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="1440">24 hours</option>
                  <option value="10080">1 week</option>
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowActionModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleExecuteAction}
                disabled={!reason.trim()}
              >
                Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};