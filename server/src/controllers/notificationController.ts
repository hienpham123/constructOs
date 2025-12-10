import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { toMySQLDateTime } from '../utils/dataHelpers.js';

/**
 * Lấy danh sách notifications của user hiện tại
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    let sql = `
      SELECT 
        id, title, message, type, priority, is_read, metadata, created_at
      FROM notifications
      WHERE user_id = ?
    `;

    const params: any[] = [userId];

    if (unreadOnly === 'true') {
      sql += ' AND is_read = FALSE';
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const notifications = await query<any[]>(sql, params);

    // Đếm tổng số unread
    const unreadCount = await query<any[]>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      notifications: notifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        priority: n.priority,
        read: n.is_read === 1 || n.is_read === true,
        metadata: n.metadata ? (typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata) : null,
        createdAt: n.created_at,
      })),
      unreadCount: unreadCount[0]?.count || 0,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách thông báo' });
  }
};

/**
 * Đánh dấu notification là đã đọc
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { notificationId } = req.params;

    // Kiểm tra notification thuộc về user
    const notifications = await query<any[]>(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    }

    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Không thể đánh dấu đã đọc' });
  }
};

/**
 * Đánh dấu tất cả notifications là đã đọc
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    await query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Không thể đánh dấu tất cả đã đọc' });
  }
};

/**
 * Xóa notification
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { notificationId } = req.params;

    // Kiểm tra notification thuộc về user
    const notifications = await query<any[]>(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    }

    await query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [
      notificationId,
      userId,
    ]);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Không thể xóa thông báo' });
  }
};

