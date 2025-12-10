import { useState, useEffect } from 'react';
import { IconButton, Badge, Popover, Box, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useNotificationSocket } from '../../hooks/useNotificationSocket';
import { getNotifications, Notification } from '../../services/api/notifications';
import { useAuthStore } from '../../stores/authStore';
import NotificationList from './NotificationList';

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const open = Boolean(anchorEl);

  // Load unread count only (nhanh hơn)
  const loadUnreadCount = async () => {
    try {
      const data = await getNotifications(1, 0, true);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Load notifications (full list)
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(50, 0, false);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load unread count ngay khi component mount và khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
    } else {
      // Reset unread count khi logout
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Load notifications khi popover mở
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  // Listen for new notifications via WebSocket
  useNotificationSocket({
    onNotificationReceived: (notification) => {
      // Add new notification to the list
      setNotifications((prev) => [notification as Notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    onUnreadCountUpdated: () => {
      // Reload unread count khi có notification mới
      loadUnreadCount();
      // Nếu popover đang mở, reload full list
      if (open) {
        loadNotifications();
      }
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationRead = () => {
    loadNotifications();
    // Cập nhật unread count sau khi đánh dấu đã đọc
    loadUnreadCount();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          color: 'text.secondary',
          position: 'relative',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <FontAwesomeIcon icon={faBell} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 400,
            maxWidth: '90vw',
            maxHeight: '80vh',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          },
        }}
      >
        <NotificationList
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          onNotificationRead={handleNotificationRead}
          onClose={handleClose}
        />
      </Popover>
    </>
  );
}

