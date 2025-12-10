import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  metadata?: Record<string, any>;
  timestamp: string;
  read: boolean;
}

interface UseNotificationSocketProps {
  onNotificationReceived: (notification: Notification) => void;
  onUnreadCountUpdated?: () => void;
}

export function useNotificationSocket({
  onNotificationReceived,
  onUnreadCountUpdated,
}: UseNotificationSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const onNotificationReceivedRef = useRef(onNotificationReceived);
  const onUnreadCountUpdatedRef = useRef(onUnreadCountUpdated);
  const { isAuthenticated } = useAuthStore();

  // Keep refs updated
  useEffect(() => {
    onNotificationReceivedRef.current = onNotificationReceived;
    onUnreadCountUpdatedRef.current = onUnreadCountUpdated;
  }, [onNotificationReceived, onUnreadCountUpdated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('auth-token');
    if (!token) return;

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:2222';
    const socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('✅ Notification socket connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Notification socket disconnected:', reason);
    });

    socket.on('notification', (notification: Notification) => {
      console.log('🔔 Nhận notification:', notification);
      onNotificationReceivedRef.current(notification);
      if (onUnreadCountUpdatedRef.current) {
        onUnreadCountUpdatedRef.current();
      }
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated]);

  return socketRef.current;
}

