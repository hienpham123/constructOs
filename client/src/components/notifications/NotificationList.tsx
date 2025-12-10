import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckDouble,
  faTrash,
  faTasks,
  faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Notification, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../services/api/notifications';
import { formatZaloTime } from '../../utils/dateFormat';

interface NotificationListProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onNotificationRead: () => void;
  onClose: () => void;
}

export default function NotificationList({
  notifications,
  unreadCount,
  loading,
  onNotificationRead,
  onClose,
}: NotificationListProps) {
  const navigate = useNavigate();
  const [markingAll, setMarkingAll] = useState(false);

  const handleNotificationClick = async (notification: Notification) => {
    // Đánh dấu đã đọc
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        onNotificationRead();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to task if it's a task assignment
    if (notification.type === 'task_assignment' && notification.metadata?.taskId && notification.metadata?.projectId) {
      navigate(`/projects/${notification.metadata.projectId}?taskId=${notification.metadata.taskId}`);
      onClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead();
      onNotificationRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      onNotificationRead();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'normal':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Thông báo
        </Typography>
        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={markingAll ? <CircularProgress size={14} /> : <FontAwesomeIcon icon={faCheckDouble} />}
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            sx={{ textTransform: 'none' }}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </Box>

      {/* Notifications List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Không có thông báo nào
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: '60vh', overflow: 'auto', p: 0 }}>
          {notifications.map((notification, index) => (
            <Box key={notification.id}>
              <ListItem
                disablePadding
                sx={{
                  backgroundColor: notification.read ? 'transparent' : '#f0f7ff',
                  '&:hover': {
                    backgroundColor: notification.read ? 'rgba(0, 0, 0, 0.04)' : '#e3f2fd',
                  },
                }}
              >
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ py: 1.5, px: 2 }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {!notification.read && (
                        <FontAwesomeIcon
                          icon={faCircle}
                          style={{ fontSize: 8, color: '#1976d2' }}
                        />
                      )}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: notification.read ? 400 : 600,
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {notification.title}
                      </Typography>
                      {notification.priority !== 'normal' && (
                        <Chip
                          label={notification.priority === 'high' ? 'Cao' : 'Thấp'}
                          size="small"
                          color={getPriorityColor(notification.priority) as any}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      {notification.type === 'task_assignment' && (
                        <FontAwesomeIcon
                          icon={faTasks}
                          style={{ fontSize: 12, color: '#666' }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {formatZaloTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDelete(e, notification.id)}
                    sx={{ ml: 1 }}
                  >
                    <FontAwesomeIcon icon={faTrash} style={{ fontSize: 14 }} />
                  </IconButton>
                </ListItemButton>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
}

