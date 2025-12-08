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

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:2222', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected for direct messages');
      
      // Join conversation if provided
      if (conversationId) {
        socket.emit('join-conversation', conversationId);
      }
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
    if (!socketRef.current || !socketRef.current.connected) return;

    if (conversationId) {
      socketRef.current.emit('join-conversation', conversationId);
    }

    return () => {
      if (socketRef.current && conversationId) {
        socketRef.current.emit('leave-conversation', conversationId);
      }
    };
  }, [conversationId]);

  return socketRef.current;
}

