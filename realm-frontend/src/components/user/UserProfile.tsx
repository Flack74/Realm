import React, { useState } from 'react';
import { User, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    display_name: user?.display_name || '',
    about_me: user?.about_me || '',
    custom_status: user?.custom_status || ''
  });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/v1/protected/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        setEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Profile</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="p-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-xl font-semibold mr-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-8 h-8" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {profile.display_name || user?.username}
          </h3>
          <p className="text-sm text-gray-400">@{user?.username}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Display Name
          </label>
          {editing ? (
            <input
              type="text"
              value={profile.display_name}
              onChange={(e) => setProfile({...profile, display_name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your display name"
            />
          ) : (
            <p className="text-white">{profile.display_name || 'Not set'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            About Me
          </label>
          {editing ? (
            <textarea
              value={profile.about_me}
              onChange={(e) => setProfile({...profile, about_me: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              placeholder="Tell us about yourself"
            />
          ) : (
            <p className="text-white">{profile.about_me || 'No description'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Custom Status
          </label>
          {editing ? (
            <input
              type="text"
              value={profile.custom_status}
              onChange={(e) => setProfile({...profile, custom_status: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="What's happening?"
            />
          ) : (
            <p className="text-white">{profile.custom_status || 'No status'}</p>
          )}
        </div>
      </div>
    </div>
  );
};