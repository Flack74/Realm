import React, { useState } from 'react';
import { Plus, Hash, Settings } from 'lucide-react';
import { useRealm } from '../../context/RealmContext';
import { CreateRealmModal } from '../modals/CreateRealmModal';
import { RealmSettings } from '../moderation/RealmSettings';

export const RealmSidebar: React.FC = () => {
  const { realms, selectedRealm, selectRealm, directMessages, selectDirectMessages } = useRealm();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="w-18 bg-gray-800 flex flex-col items-center py-3 space-y-2">
        {/* Direct Messages */}
        <div
          onClick={selectDirectMessages}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
            directMessages ? 'bg-indigo-600 rounded-2xl' : 'bg-gray-700 hover:bg-indigo-600 hover:rounded-2xl'
          }`}
        >
          <Hash className="w-6 h-6" />
        </div>

        {/* Realm Separator */}
        <div className="w-8 h-0.5 bg-gray-600 rounded-full" />

        {/* Realms */}
        {realms.map((realm) => (
          <div key={realm.id} className="relative group">
            <div
              onClick={() => selectRealm(realm)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (selectedRealm?.id === realm.id) setShowSettings(true);
              }}
              className={`relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                selectedRealm?.id === realm.id 
                  ? 'bg-indigo-600 rounded-2xl' 
                  : 'bg-gray-700 hover:bg-indigo-600 hover:rounded-2xl'
              }`}
            >
              {realm.icon ? (
                <img src={realm.icon} alt={realm.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-lg font-semibold">
                  {realm.name.charAt(0).toUpperCase()}
                </span>
              )}
              
              {/* Active Indicator */}
              {selectedRealm?.id === realm.id && (
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}
            </div>
            
            {/* Settings Button */}
            {selectedRealm?.id === realm.id && (
              <button
                onClick={() => setShowSettings(true)}
                className="absolute -right-1 -top-1 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Realm Settings"
              >
                <Settings className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {/* Add Realm Button */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-12 rounded-full bg-gray-700 hover:bg-green-600 hover:rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200"
        >
          <Plus className="w-6 h-6" />
        </div>
      </div>

      {/* Create Realm Modal */}
      {showCreateModal && (
        <CreateRealmModal onClose={() => setShowCreateModal(false)} />
      )}
      
      {/* Realm Settings Modal */}
      {showSettings && selectedRealm && (
        <RealmSettings 
          realmId={selectedRealm.id} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </>
  );
};