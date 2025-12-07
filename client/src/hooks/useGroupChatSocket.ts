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

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:2222', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected for group list');
      socket.emit('join-groups');
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
