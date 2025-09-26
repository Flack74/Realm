import React, { useState, useEffect } from 'react';
import { Gavel, Clock, Ban, UserX, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ModerationAction {
  id: string;
  action: string;
  reason: string;
  expires_at?: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    display_name?: string;
  };
  moderator: {
    id: string;
    username: string;
    display_name?: string;
  };
}

interface ModerationPanelProps {
  realmId: string;
  userId?: string;
}

export const ModerationPanel: React.FC<ModerationPanelProps> = ({ realmId, userId }) => {
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'kick' | 'ban' | 'timeout'>('kick');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    loadModerationLog();
  }, [realmId]);

  const loadModerationLog = async () => {
    try {
      const response = await fetch(`/api/v1/protected/realms/${realmId}/moderation`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActions(data);
      }
    } catch (error) {
      console.error('Failed to load moderation log:', error);
    }
  };

  const performAction = async () => {
    if (!userId) return;

    try {
      const body: any = { reason };
      if (actionType === 'ban' || actionType === 'timeout') {
        body.duration = duration;
      }

      const response = await fetch(`/api/v1/protected/realms/${realmId}/members/${userId}/${actionType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(`Member ${actionType}ed successfully`);
        setShowActionModal(false);
        setReason('');
        loadModerationLog();
      }
    } catch (error) {
      toast.error(`Failed to ${actionType} member`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'kick': return <UserX className="w-4 h-4 text-orange-400" />;
      case 'ban': return <Ban className="w-4 h-4 text-red-400" />;
      case 'timeout': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'unban': return <Shield className="w-4 h-4 text-green-400" />;
      default: return <Gavel className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Gavel className="w-6 h-6 text-red-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Moderation</h2>
        </div>
        {userId && (
          <button
            onClick={() => setShowActionModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Moderate User
          </button>
        )}
      </div>

      {/* Moderation Log */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {actions.map((action) => (
          <div key={action.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                {getActionIcon(action.action)}
                <div className="ml-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white capitalize">{action.action}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">
                      {action.user.display_name || action.user.username}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    By {action.moderator.display_name || action.moderator.username}
                  </p>
                  {action.reason && (
                    <p className="text-sm text-gray-300 mt-1">Reason: {action.reason}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(action.created_at)}
                    {action.expires_at && (
                      <span> • Expires: {formatDate(action.expires_at)}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {actions.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No moderation actions recorded
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Moderate User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="kick">Kick</option>
                  <option value="ban">Ban</option>
                  <option value="timeout">Timeout</option>
                </select>
              </div>

              {(actionType === 'ban' || actionType === 'timeout') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration ({actionType === 'ban' ? 'hours' : 'minutes'})
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    min="1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
                  rows={3}
                  placeholder="Reason for moderation action"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={performAction}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};