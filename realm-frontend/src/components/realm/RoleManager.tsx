import React, { useState } from 'react';
import { Plus, Edit, Trash2, Shield, Crown, Save, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'text' | 'voice' | 'advanced';
}

interface Role {
  id: string;
  name: string;
  color: string;
  permissions: string[];
  position: number;
  memberCount: number;
  hoist: boolean;
  mentionable: boolean;
}

export const RoleManager: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const permissions: Permission[] = [
    { id: 'ADMINISTRATOR', name: 'Administrator', description: 'All permissions', category: 'advanced' },
    { id: 'MANAGE_REALM', name: 'Manage Server', description: 'Manage server settings', category: 'general' },
    { id: 'MANAGE_ROLES', name: 'Manage Roles', description: 'Create and edit roles', category: 'general' },
    { id: 'MANAGE_CHANNELS', name: 'Manage Channels', description: 'Create, edit, delete channels', category: 'general' },
    { id: 'KICK_MEMBERS', name: 'Kick Members', description: 'Kick members from server', category: 'general' },
    { id: 'BAN_MEMBERS', name: 'Ban Members', description: 'Ban members from server', category: 'general' },
    { id: 'CREATE_INSTANT_INVITE', name: 'Create Invite', description: 'Create invite links', category: 'general' },
    { id: 'CHANGE_NICKNAME', name: 'Change Nickname', description: 'Change own nickname', category: 'general' },
    { id: 'MANAGE_NICKNAMES', name: 'Manage Nicknames', description: 'Manage others nicknames', category: 'general' },
    { id: 'SEND_MESSAGES', name: 'Send Messages', description: 'Send messages in text channels', category: 'text' },
    { id: 'MANAGE_MESSAGES', name: 'Manage Messages', description: 'Delete and edit messages', category: 'text' },
    { id: 'EMBED_LINKS', name: 'Embed Links', description: 'Links automatically embed', category: 'text' },
    { id: 'ATTACH_FILES', name: 'Attach Files', description: 'Upload files and media', category: 'text' },
    { id: 'READ_MESSAGE_HISTORY', name: 'Read Message History', description: 'Read message history', category: 'text' },
    { id: 'MENTION_EVERYONE', name: 'Mention Everyone', description: 'Use @everyone and @here', category: 'text' },
    { id: 'USE_EXTERNAL_EMOJIS', name: 'Use External Emojis', description: 'Use emojis from other servers', category: 'text' },
    { id: 'CONNECT', name: 'Connect', description: 'Connect to voice channels', category: 'voice' },
    { id: 'SPEAK', name: 'Speak', description: 'Speak in voice channels', category: 'voice' },
    { id: 'MUTE_MEMBERS', name: 'Mute Members', description: 'Mute members in voice', category: 'voice' },
    { id: 'DEAFEN_MEMBERS', name: 'Deafen Members', description: 'Deafen members in voice', category: 'voice' },
    { id: 'MOVE_MEMBERS', name: 'Move Members', description: 'Move members between voice channels', category: 'voice' }
  ];

  const roles: Role[] = [
    {
      id: '1',
      name: 'Owner',
      color: '#f04747',
      permissions: ['ADMINISTRATOR'],
      position: 100,
      memberCount: 1,
      hoist: true,
      mentionable: false
    },
    {
      id: '2',
      name: 'Admin',
      color: '#7289da',
      permissions: ['MANAGE_REALM', 'MANAGE_ROLES', 'KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS'],
      position: 90,
      memberCount: 2,
      hoist: true,
      mentionable: true
    },
    {
      id: '3',
      name: 'Moderator',
      color: '#43b581',
      permissions: ['KICK_MEMBERS', 'MANAGE_MESSAGES', 'MUTE_MEMBERS'],
      position: 80,
      memberCount: 5,
      hoist: true,
      mentionable: true
    },
    {
      id: '4',
      name: 'Member',
      color: '#99aab5',
      permissions: ['SEND_MESSAGES', 'CONNECT', 'SPEAK', 'READ_MESSAGE_HISTORY'],
      position: 1,
      memberCount: 42,
      hoist: false,
      mentionable: false
    }
  ];

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleCreateRole = () => {
    setSelectedPermissions(new Set(['SEND_MESSAGES', 'CONNECT', 'SPEAK']));
    setShowCreateModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(new Set(role.permissions));
  };

  const handlePermissionToggle = (permissionId: string) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setSelectedPermissions(newPermissions);
  };

  const handleSaveRole = () => {
    // TODO: Implement role save logic
    console.log('Saving role with permissions:', Array.from(selectedPermissions));
    setShowCreateModal(false);
    setEditingRole(null);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingRole(null);
    setSelectedPermissions(new Set());
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Roles</h2>
        <Button onClick={handleCreateRole}>
          <Plus size={16} className="mr-2" />
          Create Role
        </Button>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{role.name}</span>
                    {role.name === 'Owner' && <Crown size={16} className="text-yellow-500" />}
                    {role.permissions.includes('ADMINISTRATOR') && <Shield size={16} className="text-red-500" />}
                  </div>
                  <div className="text-sm text-gray-400">
                    {role.memberCount} members • {role.permissions.length} permissions
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditRole(role)}
                >
                  <Edit size={16} />
                </Button>
                {role.name !== 'Owner' && role.name !== 'Member' && (
                  <Button size="sm" variant="danger">
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {role.permissions.slice(0, 5).map((permId) => {
                const perm = permissions.find(p => p.id === permId);
                return perm ? (
                  <span
                    key={permId}
                    className="px-2 py-1 bg-gray-600 text-xs rounded text-gray-300"
                  >
                    {perm.name}
                  </span>
                ) : null;
              })}
              {role.permissions.length > 5 && (
                <span className="px-2 py-1 bg-gray-600 text-xs rounded text-gray-400">
                  +{role.permissions.length - 5} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Role Modal */}
      <Modal
        isOpen={showCreateModal || !!editingRole}
        onClose={handleCloseModal}
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create Role'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role Name
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter role name"
                defaultValue={editingRole?.name}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role Color
              </label>
              <input
                type="color"
                className="w-full h-10 bg-gray-700 rounded cursor-pointer"
                defaultValue={editingRole?.color || '#99aab5'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                defaultChecked={editingRole?.hoist}
              />
              <span className="text-sm text-gray-300">Display role members separately</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                defaultChecked={editingRole?.mentionable}
              />
              <span className="text-sm text-gray-300">Allow anyone to mention this role</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Permissions
            </label>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                    {category} Permissions
                  </h4>
                  <div className="space-y-2">
                    {perms.map((perm) => (
                      <label key={perm.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedPermissions.has(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{perm.name}</div>
                          <div className="text-xs text-gray-400">{perm.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleCloseModal}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>
              <Save size={16} className="mr-2" />
              {editingRole ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};