import React, { useState } from 'react';
import { X, Settings, Users, Shield, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RealmSettingsModalProps {
  realm: {
    id: string;
    name: string;
    description?: string;
    invite_code: string;
  };
  onClose: () => void;
  onRealmUpdated: () => void;
}

export const RealmSettingsModal: React.FC<RealmSettingsModalProps> = ({
  realm,
  onClose,
  onRealmUpdated
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState(realm.name);
  const [description, setDescription] = useState(realm.description || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/protected/realms/${realm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, description })
      });

      if (response.ok) {
        toast.success('Realm updated successfully');
        onRealmUpdated();
        onClose();
      } else {
        toast.error('Failed to update realm');
      }
    } catch (error) {
      toast.error('Failed to update realm');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(realm.invite_code);
    toast.success('Invite code copied to clipboard');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'roles', label: 'Roles', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-[600px] flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 rounded-l-lg p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Realm Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">General Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Realm Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="What's this realm about?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Invite Code
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={realm.invite_code}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white"
                      />
                      <button
                        onClick={copyInviteCode}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'members' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Members</h3>
              <p className="text-gray-400">Member management coming soon...</p>
            </div>
          )}
          
          {activeTab === 'roles' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Roles & Permissions</h3>
              <p className="text-gray-400">Role management coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};