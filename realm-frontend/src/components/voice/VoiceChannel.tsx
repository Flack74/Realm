import React from 'react';
import { Volume2, Users, Monitor, MonitorSpeaker } from 'lucide-react';
import { useVoiceChat } from '../../hooks/useVoiceChat';

interface VoiceChannelProps {
  channel: {
    id: string;
    name: string;
    user_limit: number;
  };
}

export const VoiceChannel: React.FC<VoiceChannelProps> = ({ channel }) => {
  const { voiceState, joinVoiceChannel, leaveVoiceChannel } = useVoiceChat();

  const isConnected = voiceState.connected && voiceState.channelId === channel.id;
  const userCount = voiceState.users.length;

  const handleClick = () => {
    if (isConnected) {
      leaveVoiceChannel();
    } else {
      joinVoiceChannel(channel.id);
    }
  };

  return (
    <div className="ml-2">
      <div
        onClick={handleClick}
        className={`flex items-center px-2 py-1 rounded cursor-pointer transition-colors group ${
          isConnected
            ? 'bg-green-600 text-white'
            : 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
        }`}
      >
        <Volume2 className="w-4 h-4 mr-2" />
        <span className="flex-1 truncate">{channel.name}</span>
        
        {userCount > 0 && (
          <div className="flex items-center ml-2">
            <Users className="w-3 h-3 mr-1" />
            <span className="text-xs">{userCount}</span>
            {channel.user_limit > 0 && (
              <span className="text-xs">/{channel.user_limit}</span>
            )}
          </div>
        )}
      </div>

      {/* Connected Users */}
      {isConnected && voiceState.users.length > 0 && (
        <div className="ml-6 mt-1 space-y-1">
          {voiceState.users.map((voiceUser) => (
            <div key={voiceUser.id} className="flex items-center text-sm text-gray-300">
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-semibold mr-2">
                {(voiceUser.user.display_name || voiceUser.user.username).charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 truncate">
                {voiceUser.user.display_name || voiceUser.user.username}
              </span>
              
              {/* Voice indicators */}
              <div className="flex items-center space-x-1">
                {voiceUser.self_muted && (
                  <div className="w-3 h-3 bg-red-500 rounded-full" title="Muted" />
                )}
                {voiceUser.self_deaf && (
                  <div className="w-3 h-3 bg-gray-500 rounded-full" title="Deafened" />
                )}
                {voiceUser.streaming && (
                  <Monitor className="w-3 h-3 text-green-400" title="Screen sharing" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};