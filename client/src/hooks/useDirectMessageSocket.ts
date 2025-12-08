import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseDirectMessageSocketProps {
  conversationId?: string | null;
  onMessageReceived?: (data: { conversationId: string; message: any }) => void;
  onConversationUpdated?: (data: { conversationId: string; forReceiverOnly?: boolean }) => void;
}

export function useDirectMessageSocket({ 
  conversationId,
  onMessageReceived,
  onConversationUpdated 
}: UseDirectMessageSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const onMessageReceivedRef = useRef(onMessageReceived);
  const onConversationUpdatedRef = useRef(onConversationUpdated);

  // Keep refs updated
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
    onConversationUpdatedRef.current = onConversationUpdated;
  }, [onMessageReceived, onConversationUpdated]);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:2222', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    const joinConversation = () => {
      if (socket.connected && conversationId) {
        console.log('Joining conversation:', conversationId);
        // Small delay to ensure socket is fully ready
        setTimeout(() => {
          if (socket.connected && conversationId) {
            socket.emit('join-conversation', conversationId);
          }
        }, 100);
      }
    };

    socket.on('connect', () => {
      console.log('Socket connected for direct messages');
      joinConversation();
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      // Socket.io will automatically attempt to reconnect
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      // Rejoin conversation after reconnection
      joinConversation();
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Reconnection failed - max attempts reached');
    });

    // Listen for new direct messages
    socket.on('direct-message-received', (data: { conversationId: string; message: any }) => {
      if (onMessageReceivedRef.current) {
        onMessageReceivedRef.current(data);
      }
    });

    // Listen for conversation updates (for conversation list)
    socket.on('conversation-updated', (data: { conversationId: string }) => {
      if (onConversationUpdatedRef.current) {
        onConversationUpdatedRef.current(data);
      }
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        // Leave conversation before disconnecting
        if (conversationId) {
          socketRef.current.emit('leave-conversation', conversationId);
        }
        socketRef.current.disconnect();
      }
    };
  }, []); // Only initialize once

  // Join/leave conversation when conversationId changes
  useEffect(() => {
    if (!socketRef.current) return;

    // If not connected, wait for connection then join
    if (!socketRef.current.connected) {
      const onConnect = () => {
        if (conversationId) {
          socketRef.current?.emit('join-conversation', conversationId);
        }
      };
      socketRef.current.once('connect', onConnect);
      return () => {
        socketRef.current?.off('connect', onConnect);
      };
    }

    if (conversationId) {
      socketRef.current.emit('join-conversation', conversationId);
    }

    return () => {
      if (socketRef.current && conversationId && socketRef.current.connected) {
        socketRef.current.emit('leave-conversation', conversationId);
      }
    };
  }, [conversationId]);

  return socketRef.current;
}

