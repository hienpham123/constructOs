import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes yêu cầu authentication
router.use(authenticate);

// GET /api/notifications - Lấy danh sách notifications
router.get('/', getNotifications);

// PUT /api/notifications/:id/read - Đánh dấu đã đọc
router.put('/:notificationId/read', markAsRead);

// PUT /api/notifications/read-all - Đánh dấu tất cả đã đọc
router.put('/read-all', markAllAsRead);

// DELETE /api/notifications/:id - Xóa notification
router.delete('/:notificationId', deleteNotification);

export default router;

