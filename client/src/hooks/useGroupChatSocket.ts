import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseGroupChatSocketProps {
  onMessageReceived: (data: { groupId: string; message: any }) => void;
  onUnreadUpdated: () => void;
}

export function useGroupChatSocket({ onMessageReceived, onUnreadUpdated }: UseGroupChatSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const onMessageReceivedRef = useRef(onMessageReceived);
  const onUnreadUpdatedRef = useRef(onUnreadUpdated);

  // Keep refs updated
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
    onUnreadUpdatedRef.current = onUnreadUpdated;
  }, [onMessageReceived, onUnreadUpdated]);

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

    const joinGroups = () => {
      if (socket.connected) {
        console.log('Joining groups for group list');
        // Small delay to ensure socket is fully ready
        setTimeout(() => {
          if (socket.connected) {
            socket.emit('join-groups');
          }
        }, 100);
      }
    };

    socket.on('connect', () => {
      console.log('Socket connected for group list');
      joinGroups();
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected (group list):', reason);
      // Socket.io will automatically attempt to reconnect
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected (group list) after', attemptNumber, 'attempts');
      // Rejoin groups after reconnection
      joinGroups();
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt (group list):', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error (group list):', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Reconnection failed (group list) - max attempts reached');
    });

    // Listen for new messages to update group list
    socket.on('message-received', (data) => {
      onMessageReceivedRef.current(data);
    });

    // Listen for unread updates
    socket.on('unread-updated', () => {
      onUnreadUpdatedRef.current();
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
}
