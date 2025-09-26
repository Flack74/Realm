import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface VoiceState {
  connected: boolean;
  muted: boolean;
  deafened: boolean;
  streaming: boolean;
  channelId: string | null;
  users: VoiceUser[];
}

interface VoiceUser {
  id: string;
  user: {
    id: string;
    username: string;
    display_name?: string;
  };
  self_muted: boolean;
  self_deaf: boolean;
  streaming: boolean;
}

export const useVoiceChat = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    connected: false,
    muted: false,
    deafened: false,
    streaming: false,
    channelId: null,
    users: []
  });

  const [pushToTalk, setPushToTalk] = useState(false);
  const [pushToTalkKey, setPushToTalkKey] = useState('Space');
  const [isKeyPressed, setIsKeyPressed] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const joinVoiceChannel = async (channelId: string) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      localStreamRef.current = stream;

      // Join voice channel on backend
      const response = await fetch('/api/v1/protected/voice/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ channel_id: channelId })
      });

      if (response.ok) {
        setVoiceState(prev => ({
          ...prev,
          connected: true,
          channelId
        }));
        
        // Load voice users
        loadVoiceUsers(channelId);
        toast.success('Connected to voice channel');
      }
    } catch (error) {
      console.error('Failed to join voice:', error);
      toast.error('Failed to access microphone');
    }
  };

  const leaveVoiceChannel = async () => {
    try {
      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      // Close peer connections
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();

      // Leave on backend
      await fetch('/api/v1/protected/voice/leave', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      setVoiceState({
        connected: false,
        muted: false,
        deafened: false,
        streaming: false,
        channelId: null,
        users: []
      });

      toast.success('Disconnected from voice');
    } catch (error) {
      console.error('Failed to leave voice:', error);
    }
  };

  const toggleMute = async () => {
    const newMuted = !voiceState.muted;
    
    // Mute/unmute local stream
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMuted;
      });
    }

    // Update backend
    await updateVoiceState({ muted: newMuted });
    
    setVoiceState(prev => ({ ...prev, muted: newMuted }));
  };

  const toggleDeafen = async () => {
    const newDeafened = !voiceState.deafened;
    
    // If deafening, also mute
    if (newDeafened && !voiceState.muted) {
      await toggleMute();
    }

    await updateVoiceState({ deafened: newDeafened });
    setVoiceState(prev => ({ ...prev, deafened: newDeafened }));
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track in peer connections
      const videoTrack = stream.getVideoTracks()[0];
      peerConnectionsRef.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        } else {
          pc.addTrack(videoTrack, stream);
        }
      });

      await updateVoiceState({ streaming: true });
      setVoiceState(prev => ({ ...prev, streaming: true }));
      
      // Stop sharing when stream ends
      videoTrack.onended = () => {
        stopScreenShare();
      };

      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Failed to start screen share:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  const stopScreenShare = async () => {
    // Remove video tracks from peer connections
    peerConnectionsRef.current.forEach(pc => {
      const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (videoSender) {
        pc.removeTrack(videoSender);
      }
    });

    await updateVoiceState({ streaming: false });
    setVoiceState(prev => ({ ...prev, streaming: false }));
    toast.success('Screen sharing stopped');
  };

  const updateVoiceState = async (updates: Partial<VoiceState>) => {
    try {
      await fetch('/api/v1/protected/voice/state', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Failed to update voice state:', error);
    }
  };

  const loadVoiceUsers = async (channelId: string) => {
    try {
      const response = await fetch(`/api/v1/protected/voice/channels/${channelId}/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const users = await response.json();
        setVoiceState(prev => ({ ...prev, users }));
      }
    } catch (error) {
      console.error('Failed to load voice users:', error);
    }
  };

  // Push-to-talk functionality
  useEffect(() => {
    if (!pushToTalk || !voiceState.connected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === pushToTalkKey && !isKeyPressed) {
        setIsKeyPressed(true);
        if (localStreamRef.current && voiceState.muted) {
          localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = true;
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === pushToTalkKey && isKeyPressed) {
        setIsKeyPressed(false);
        if (localStreamRef.current && voiceState.muted) {
          localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = false;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pushToTalk, pushToTalkKey, isKeyPressed, voiceState.connected, voiceState.muted]);

  return {
    voiceState,
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
    startScreenShare,
    stopScreenShare,
    pushToTalk,
    setPushToTalk,
    pushToTalkKey,
    setPushToTalkKey,
    isKeyPressed
  };
};