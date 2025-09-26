import { useEffect, useRef, useState, useCallback } from 'react';

interface WSMessage {
  type: string;
  data: any;
  realm_id?: string;
  channel_id?: string;
  user_id: string;
  timestamp: string;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const subscribedChannels = useRef<Set<string>>(new Set());
  const subscribedRealms = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    wsRef.current = new WebSocket(options.url);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      options.onConnect?.();
      
      // Resubscribe to channels and realms
      subscribedChannels.current.forEach(channelId => {
        joinChannel(channelId);
      });
      subscribedRealms.current.forEach(realmId => {
        joinRealm(realmId);
      });
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        options.onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      options.onDisconnect?.();
      
      // Attempt reconnection with exponential backoff
      if (reconnectAttempts < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, delay);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [options, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: Partial<WSMessage>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    }
  }, []);

  // Channel management
  const joinChannel = useCallback((channelId: string) => {
    subscribedChannels.current.add(channelId);
    sendMessage({
      type: 'JOIN_CHANNEL',
      channel_id: channelId
    });
  }, [sendMessage]);

  const leaveChannel = useCallback((channelId: string) => {
    subscribedChannels.current.delete(channelId);
    sendMessage({
      type: 'LEAVE_CHANNEL',
      channel_id: channelId
    });
  }, [sendMessage]);

  // Realm management
  const joinRealm = useCallback((realmId: string) => {
    subscribedRealms.current.add(realmId);
    sendMessage({
      type: 'JOIN_REALM',
      realm_id: realmId
    });
  }, [sendMessage]);

  const leaveRealm = useCallback((realmId: string) => {
    subscribedRealms.current.delete(realmId);
    sendMessage({
      type: 'LEAVE_REALM',
      realm_id: realmId
    });
  }, [sendMessage]);

  // Typing indicators
  const startTyping = useCallback((channelId: string) => {
    sendMessage({
      type: 'TYPING_START',
      channel_id: channelId
    });
  }, [sendMessage]);

  const stopTyping = useCallback((channelId: string) => {
    sendMessage({
      type: 'TYPING_STOP',
      channel_id: channelId
    });
  }, [sendMessage]);

  // Message operations
  const sendChatMessage = useCallback((channelId: string, content: string, replyTo?: string) => {
    sendMessage({
      type: 'MESSAGE_CREATE',
      channel_id: channelId,
      data: {
        content,
        reply_to: replyTo
      }
    });
  }, [sendMessage]);

  const editMessage = useCallback((messageId: string, content: string) => {
    sendMessage({
      type: 'MESSAGE_UPDATE',
      data: {
        message_id: messageId,
        content
      }
    });
  }, [sendMessage]);

  const deleteMessage = useCallback((messageId: string) => {
    sendMessage({
      type: 'MESSAGE_DELETE',
      data: {
        message_id: messageId
      }
    });
  }, [sendMessage]);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    sendMessage({
      type: 'MESSAGE_REACTION_ADD',
      data: {
        message_id: messageId,
        emoji
      }
    });
  }, [sendMessage]);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    sendMessage({
      type: 'MESSAGE_REACTION_REMOVE',
      data: {
        message_id: messageId,
        emoji
      }
    });
  }, [sendMessage]);

  // Voice operations
  const joinVoiceChannel = useCallback((channelId: string) => {
    sendMessage({
      type: 'VOICE_STATE_UPDATE',
      channel_id: channelId,
      data: {
        action: 'join'
      }
    });
  }, [sendMessage]);

  const leaveVoiceChannel = useCallback((channelId: string) => {
    sendMessage({
      type: 'VOICE_STATE_UPDATE',
      channel_id: channelId,
      data: {
        action: 'leave'
      }
    });
  }, [sendMessage]);

  const updateVoiceState = useCallback((channelId: string, muted: boolean, deafened: boolean) => {
    sendMessage({
      type: 'VOICE_STATE_UPDATE',
      channel_id: channelId,
      data: {
        self_muted: muted,
        self_deafened: deafened
      }
    });
  }, [sendMessage]);

  // User presence
  const updatePresence = useCallback((status: string, activity?: string) => {
    sendMessage({
      type: 'PRESENCE_UPDATE',
      data: {
        status,
        activity
      }
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    reconnectAttempts,
    sendMessage,
    joinChannel,
    leaveChannel,
    joinRealm,
    leaveRealm,
    startTyping,
    stopTyping,
    sendChatMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    joinVoiceChannel,
    leaveVoiceChannel,
    updateVoiceState,
    updatePresence
  };
};