import React, { useState } from 'react';
import { X, User, Users, Bell, Shield } from 'lucide-react';
import { UserProfile } from '../user/UserProfile';
import { FriendsList } from '../user/FriendsList';

interface UserSettingsModalProps {
  onClose: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'notifications' | 'privacy'>('profile');

  const tabs = [
    { id: 'profile', label: 'My Account', icon: User },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Safety', icon: Shield }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">User Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'profile' && <UserProfile />}
          {activeTab === 'friends' && <FriendsList />}
          {activeTab === 'notifications' && (
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-4">Notifications</h3>
              <p className="text-gray-400">Notification settings coming soon...</p>
            </div>
          )}
          {activeTab === 'privacy' && (
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-4">Privacy & Safety</h3>
              <p className="text-gray-400">Privacy settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};