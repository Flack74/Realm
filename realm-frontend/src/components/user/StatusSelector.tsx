import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activity, setActivity] = useState('');

  const statuses = [
    { value: 'online', label: 'Online', color: 'bg-green-500' },
    { value: 'idle', label: 'Idle', color: 'bg-yellow-500' },
    { value: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
    { value: 'invisible', label: 'Invisible', color: 'bg-gray-500' }
  ];

  const handleStatusChange = async (status: string) => {
    try {
      const response = await fetch('/api/v1/protected/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, activity })
      });

      if (response.ok) {
        onStatusChange(status);
        toast.success('Status updated');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
    setIsOpen(false);
  };

  const currentStatusObj = statuses.find(s => s.value === currentStatus) || statuses[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
      >
        <div className={`w-3 h-3 rounded-full ${currentStatusObj.color}`} />
        <span className="text-sm text-white">{currentStatusObj.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-[200px] z-50">
          <div className="p-3 border-b border-gray-700">
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Set activity..."
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="py-2">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-700 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <span className="text-sm text-white">{status.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};