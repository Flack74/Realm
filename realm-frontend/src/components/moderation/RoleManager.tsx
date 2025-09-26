import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit3, Trash2, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  color: string;
  position: number;
  permissions: number;
  mentionable: boolean;
  hoisted: boolean;
}

interface RoleManagerProps {
  realmId: string;
}

export const RoleManager: React.FC<RoleManagerProps> = ({ realmId }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    color: '#99aab5',
    permissions: 0,
    mentionable: true,
    hoisted: false
  });

  const permissions = [
    { name: 'View Channels', value: 1 },
    { name: 'Send Messages', value: 2 },
    { name: 'Manage Messages', value: 4 },
    { name: 'Manage Channels', value: 8 },
    { name: 'Manage Roles', value: 16 },
    { name: 'Kick Members', value: 32 },
    { name: 'Ban Members', value: 64 },
    { name: 'Administrator', value: 128 }
  ];

  useEffect(() => {
    loadRoles();
  }, [realmId]);

  const loadRoles = async () => {
    try {
      const response = await fetch(`/api/v1/protected/realms/${realmId}/roles`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const createRole = async () => {
    try {
      const response = await fetch(`/api/v1/protected/realms/${realmId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newRole)
      });

      if (response.ok) {
        toast.success('Role created successfully');
        setShowCreateRole(false);
        setNewRole({ name: '', color: '#99aab5', permissions: 0, mentionable: true, hoisted: false });
        loadRoles();
      }
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Delete this role?')) return;

    try {
      const response = await fetch(`/api/v1/protected/roles/${roleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        toast.success('Role deleted');
        loadRoles();
      }
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const hasPermission = (rolePermissions: number, permission: number) => {
    return (rolePermissions & permission) === permission;
  };

  const togglePermission = (currentPermissions: number, permission: number) => {
    return currentPermissions ^ permission;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="w-6 h-6 text-indigo-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Roles</h2>
        </div>
        <button
          onClick={() => setShowCreateRole(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </button>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <div key={role.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: role.color }}
              />
              <div>
                <h3 className="font-medium text-white">{role.name}</h3>
                <p className="text-sm text-gray-400">
                  {permissions.filter(p => hasPermission(role.permissions, p.value)).length} permissions
                </p>
              </div>
              {role.hoisted && <Crown className="w-4 h-4 text-yellow-400 ml-2" />}
            </div>
            
            <button
              onClick={() => deleteRole(role.id)}
              className="p-2 text-gray-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showCreateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Create Role</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="Role name"
              />

              <input
                type="color"
                value={newRole.color}
                onChange={(e) => setNewRole({...newRole, color: e.target.value})}
                className="w-full h-10 bg-gray-700 border border-gray-600 rounded-md"
              />

              <div className="max-h-40 overflow-y-auto space-y-1">
                {permissions.map((perm) => (
                  <label key={perm.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasPermission(newRole.permissions, perm.value)}
                      onChange={() => setNewRole({
                        ...newRole,
                        permissions: togglePermission(newRole.permissions, perm.value)
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">{perm.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateRole(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createRole}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};