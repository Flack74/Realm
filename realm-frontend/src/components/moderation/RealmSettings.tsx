import React, { useState } from 'react';
import { Settings, Shield, Users, Gavel } from 'lucide-react';
import { RoleManager } from './RoleManager';
import { ModerationPanel } from './ModerationPanel';

interface RealmSettingsProps {
  realmId: string;
  onClose: () => void;
}

export const RealmSettings: React.FC<RealmSettingsProps> = ({ realmId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'moderation'>('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'moderation', label: 'Moderation', icon: Gavel }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[80vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Realm Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
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
          {activeTab === 'general' && (
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-4">General Settings</h3>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Realm Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="Enter realm name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
                      rows={3}
                      placeholder="Describe your realm"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-300">Public Realm</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-300">NSFW Content</span>
                    </label>
                  </div>

                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && <RoleManager realmId={realmId} />}
          {activeTab === 'moderation' && <ModerationPanel realmId={realmId} />}
        </div>
      </div>
    </div>
  );
};