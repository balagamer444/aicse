import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

export interface WebSocketMessage {
  type: 'chat_message' | 'ai_response' | 'emergency_alert' | 'error';
  data?: any;
  message?: string;
  analysis?: any;
  followupQuestions?: string[];
}

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const { isAuthenticated, user } = useAuth();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!isAuthenticated || socket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      newSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      newSocket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);

        // Attempt to reconnect
        if (isAuthenticated && reconnectAttemptsRef.current < 5) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, Math.pow(2, reconnectAttemptsRef.current) * 1000);
        }
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [isAuthenticated, socket?.readyState]);

  const sendMessage = useCallback((message: any) => {
    if (socket?.readyState === WebSocket.OPEN && user) {
      const messageWithUser = {
        ...message,
        userId: user.id,
      };
      socket.send(JSON.stringify(messageWithUser));
      return true;
    }
    return false;
  }, [socket, user]);

  const sendChatMessage = useCallback((message: string, doctorId?: string, conversationHistory?: any[]) => {
    return sendMessage({
      type: 'chat_message',
      message,
      doctorId,
      conversationHistory,
    });
  }, [sendMessage]);

  const sendEmergency = useCallback((emergencyData: any) => {
    return sendMessage({
      type: 'emergency',
      emergencyData,
    });
  }, [sendMessage]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socket?.close();
    };
  }, [isAuthenticated, connect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    sendChatMessage,
    sendEmergency,
  };
}
