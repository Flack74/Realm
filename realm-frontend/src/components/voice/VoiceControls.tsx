import React, { useState } from 'react';
import { Mic, MicOff, Headphones, HeadphonesIcon, Settings, PhoneOff, Monitor, MonitorOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVoiceChat } from '../../hooks/useVoiceChat';

export const VoiceControls: React.FC = () => {
  const { user } = useAuth();
  const { 
    voiceState, 
    toggleMute, 
    toggleDeafen, 
    startScreenShare, 
    stopScreenShare, 
    leaveVoiceChannel,
    pushToTalk,
    setPushToTalk,
    isKeyPressed
  } = useVoiceChat();
  const [showSettings, setShowSettings] = useState(false);

  if (!voiceState.connected) return null;

  return (
    <div className="fixed bottom-0 left-18 w-60 bg-gray-900 border-t border-gray-700 p-2">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="relative mr-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.username || 'User'}
            </div>
            <div className="text-xs text-gray-400">
              {pushToTalk ? (isKeyPressed ? 'Speaking...' : 'Push to talk') : 'Voice Connected'}
            </div>
          </div>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleMute}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              voiceState.muted ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title={voiceState.muted ? 'Unmute' : 'Mute'}
          >
            {voiceState.muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleDeafen}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              voiceState.deafened ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title={voiceState.deafened ? 'Undeafen' : 'Deafen'}
          >
            {voiceState.deafened ? <HeadphonesIcon className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
          </button>

          <button
            onClick={voiceState.streaming ? stopScreenShare : startScreenShare}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              voiceState.streaming ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title={voiceState.streaming ? 'Stop sharing' : 'Share screen'}
          >
            {voiceState.streaming ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            title="Voice Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={leaveVoiceChannel}
            className="p-2 rounded text-gray-400 hover:text-white hover:bg-red-600 transition-colors"
            title="Disconnect"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Settings Panel */}
      {showSettings && (
        <div className="mt-2 p-3 bg-gray-800 rounded border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Push to Talk</span>
            <button
              onClick={() => setPushToTalk(!pushToTalk)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                pushToTalk ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}
            >
              {pushToTalk ? 'ON' : 'OFF'}
            </button>
          </div>
          {pushToTalk && (
            <div className="text-xs text-gray-400">
              Press and hold <kbd className="bg-gray-700 px-1 rounded">Space</kbd> to speak
            </div>
          )}
        </div>
      )}
    </div>
  );
};