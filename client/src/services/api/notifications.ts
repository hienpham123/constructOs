import api from './instance';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task_assignment' | 'task_update' | 'message' | 'system';
  priority: 'low' | 'normal' | 'high';
  read: boolean;
  metadata: {
    taskId?: string;
    projectId?: string;
    taskTitle?: string;
    projectName?: string;
    createdByName?: string;
    dueDate?: string;
    priority?: string;
  } | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const getNotifications = async (
  limit = 50,
  offset = 0,
  unreadOnly = false
): Promise<NotificationsResponse> => {
  const response = await api.get<NotificationsResponse>('/notifications', {
    params: { limit, offset, unreadOnly },
  });
  return response.data;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await api.put(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<{ unreadCount: number }>('/notifications', {
    params: { limit: 1, offset: 0, unreadOnly: true },
  });
  return response.data.unreadCount;
};

