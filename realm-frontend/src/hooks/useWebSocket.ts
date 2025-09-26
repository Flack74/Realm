import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface WSMessage {
  type: string;
  data: any;
  realm_id?: string;
  channel_id?: string;
  user_id?: string;
}

export const useWebSocket = () => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!token) return;

    const wsUrl = `ws://localhost:8080/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setConnected(false);
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const timeout = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, timeout);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socket) {
      socket.close();
      setSocket(null);
    }
    setConnected(false);
  };

  const sendMessage = (message: WSMessage) => {
    if (socket && connected) {
      socket.send(JSON.stringify(message));
    }
  };

  const joinRealm = (realmId: string) => {
    sendMessage({
      type: 'join_realm',
      data: {},
      realm_id: realmId
    });
  };

  const joinChannel = (channelId: string) => {
    sendMessage({
      type: 'join_channel',
      data: {},
      channel_id: channelId
    });
  };

  const startTyping = (channelId: string) => {
    sendMessage({
      type: 'typing_start',
      data: {},
      channel_id: channelId
    });
  };

  const stopTyping = (channelId: string) => {
    sendMessage({
      type: 'typing_stop',
      data: {},
      channel_id: channelId
    });
  };

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token]);

  return {
    connected,
    messages,
    sendMessage,
    joinRealm,
    joinChannel,
    startTyping,
    stopTyping,
    clearMessages: () => setMessages([])
  };
};