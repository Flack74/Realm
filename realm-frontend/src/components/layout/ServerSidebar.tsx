import React from 'react';
import { Plus, Home } from 'lucide-react';

interface ServerSidebarProps {
  selectedRealm: string | null;
  onRealmSelect: (realmId: string) => void;
}

export const ServerSidebar: React.FC<ServerSidebarProps> = ({
  selectedRealm,
  onRealmSelect
}) => {
  const realms = [
    { id: '1', name: 'General', icon: '🏠' },
    { id: '2', name: 'Gaming', icon: '🎮' },
    { id: '3', name: 'Work', icon: '💼' }
  ];

  return (
    <div className="w-18 bg-gray-900 flex flex-col items-center py-3 space-y-2">
      {/* Home/DM Button */}
      <button
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
          !selectedRealm 
            ? 'bg-indigo-600 text-white' 
            : 'bg-gray-700 hover:bg-indigo-600 hover:rounded-2xl text-gray-300 hover:text-white'
        }`}
        onClick={() => onRealmSelect('')}
      >
        <Home size={20} />
      </button>

      <div className="w-8 h-0.5 bg-gray-600 rounded-full" />

      {/* Realm List */}
      {realms.map((realm) => (
        <button
          key={realm.id}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all duration-200 ${
            selectedRealm === realm.id
              ? 'bg-indigo-600 text-white rounded-2xl'
              : 'bg-gray-700 hover:bg-indigo-600 hover:rounded-2xl text-gray-300 hover:text-white'
          }`}
          onClick={() => onRealmSelect(realm.id)}
          title={realm.name}
        >
          {realm.icon}
        </button>
      ))}

      {/* Add Server Button */}
      <button
        className="w-12 h-12 rounded-full bg-gray-700 hover:bg-green-600 hover:rounded-2xl flex items-center justify-center text-green-400 hover:text-white transition-all duration-200"
        title="Add a Server"
      >
        <Plus size={20} />
      </button>
    </div>
  );
};