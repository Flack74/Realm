import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Headphones, HeadphonesOff, PhoneOff, Settings } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface VoiceParticipant {
  id: string;
  username: string;
  avatar?: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
}

interface VoiceChannelProps {
  channelId: string;
  channelName: string;
  onLeave: () => void;
}

export const VoiceChannel: React.FC<VoiceChannelProps> = ({
  channelId,
  channelName,
  onLeave
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([
    {
      id: '1',
      username: 'user1',
      isMuted: false,
      isDeafened: false,
      isSpeaking: true
    },
    {
      id: '2',
      username: 'user2',
      isMuted: true,
      isDeafened: false,
      isSpeaking: false
    },
    {
      id: '3',
      username: 'user3',
      isMuted: false,
      isDeafened: true,
      isSpeaking: false
    }
  ]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Update voice state via WebRTC
  };

  const toggleDeafen = () => {
    const newDeafened = !isDeafened;
    setIsDeafened(newDeafened);
    if (newDeafened) {
      setIsMuted(true); // Deafening also mutes
    }
    // TODO: Update voice state via WebRTC
  };

  return (
    <div className="bg-gray-700 border-t border-gray-600">
      {/* Voice Channel Header */}
      <div className="px-4 py-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-white">
              Voice Connected
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {channelName}
          </span>
        </div>
      </div>

      {/* Participants */}
      <div className="px-4 py-2 max-h-32 overflow-y-auto">
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-3">
              <div className="relative">
                <Avatar
                  src={participant.avatar}
                  alt={participant.username}
                  fallback={participant.username}
                  size="sm"
                />
                {participant.isSpeaking && (
                  <div className="absolute -inset-0.5 border-2 border-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white truncate block">
                  {participant.username}
                </span>
              </div>
              <div className="flex space-x-1">
                {participant.isMuted && (
                  <MicOff size={12} className="text-red-500" />
                )}
                {participant.isDeafened && (
                  <HeadphonesOff size={12} className="text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Controls */}
      <div className="px-4 py-3 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={isMuted ? 'danger' : 'secondary'}
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </Button>
            <Button
              size="sm"
              variant={isDeafened ? 'danger' : 'secondary'}
              onClick={toggleDeafen}
              title={isDeafened ? 'Undeafen' : 'Deafen'}
            >
              {isDeafened ? <HeadphonesOff size={16} /> : <Headphones size={16} />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              title="Voice Settings"
            >
              <Settings size={16} />
            </Button>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={onLeave}
            title="Disconnect"
          >
            <PhoneOff size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};