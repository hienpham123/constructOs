/**
 * Notification Service - MIỄN PHÍ VÀ KHÔNG GIỚI HẠN
 * 
 * Hỗ trợ 2 phương thức:
 * 1. Email (Gmail/Outlook - FREE, không giới hạn)
 * 2. In-App Notifications (WebSocket - FREE, không giới hạn)
 */

import { query } from '../config/db.js';
import nodemailer from 'nodemailer';

interface NotificationOptions {
  userId: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
  type?: 'task_assignment' | 'task_update' | 'message' | 'system';
  metadata?: Record<string, any>;
}

/**
 * Gửi thông báo qua Email và In-App (FREE, không giới hạn)
 */
export async function sendNotification(options: NotificationOptions): Promise<void> {
  try {
    // Lấy thông tin user
    const users = await query<any[]>(
      'SELECT id, name, email, phone FROM users WHERE id = ?',
      [options.userId]
    );

    if (users.length === 0) {
      console.warn(`⚠️ Không tìm thấy user với ID: ${options.userId}`);
      return;
    }

    const user = users[0];
    const results: string[] = [];

    // 1. Gửi Email (FREE, không giới hạn)
    if (user.email) {
      try {
        await sendEmailNotification({
          to: user.email,
          name: user.name,
          subject: options.title,
          message: options.message,
        });
        results.push('Email');
        console.log(`✅ Đã gửi thông báo Email cho ${user.name}`);
      } catch (error) {
        console.warn('⚠️ Lỗi gửi Email:', error);
      }
    }

    // 2. Gửi In-App Notification (FREE, không giới hạn)
    // Lưu ý: sendInAppNotification đã tự động lưu vào database rồi, không cần lưu lại
    try {
      await sendInAppNotification({
        userId: options.userId,
        title: options.title,
        message: options.message,
        type: options.type || 'system',
        priority: options.priority || 'normal',
        metadata: options.metadata,
      });
      results.push('In-App');
      console.log(`✅ Đã gửi thông báo In-App cho ${user.name}`);
    } catch (error) {
      console.warn('⚠️ Lỗi gửi In-App notification:', error);
    }

    if (results.length > 0) {
      console.log(`✅ Đã gửi thông báo qua: ${results.join(', ')}`);
    } else {
      console.warn(`⚠️ Không thể gửi thông báo cho ${user.name}`);
    }
  } catch (error) {
    console.error('❌ Lỗi khi gửi thông báo:', error);
    // Không throw để không ảnh hưởng đến flow chính
  }
}

/**
 * Gửi email thông báo (sử dụng Gmail/Outlook - FREE)
 */
async function sendEmailNotification(params: {
  to: string;
  name: string;
  subject: string;
  message: string;
}): Promise<void> {
  const { EMAIL_SERVICE, EMAIL_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // Nếu chưa cấu hình email, chỉ log
  if (!EMAIL_SERVICE && !SMTP_HOST) {
    console.log('📧 Email chưa được cấu hình. Xem EMAIL_SETUP.md để cấu hình.');
    console.log(`   To: ${params.to}`);
    console.log(`   Subject: ${params.subject}`);
    return;
  }

  let transporter;

  try {
    if (EMAIL_SERVICE === 'gmail') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS, // App password từ Google Account
        },
      });
    } else if (SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
    } else {
      console.warn('⚠️ Email chưa được cấu hình đúng');
      return;
    }

    const mailOptions = {
      from: EMAIL_FROM || SMTP_USER,
      to: params.to,
      subject: params.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .message { background: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${params.subject}</h2>
            </div>
            <div class="content">
              <p>Xin chào <strong>${params.name}</strong>,</p>
              <div class="message">
                ${params.message.replace(/\n/g, '<br>')}
              </div>
              <p>Trân trọng,<br>Hệ thống ConstructOS</p>
            </div>
            <div class="footer">
              <p>Đây là thông báo tự động từ hệ thống. Vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi email đến ${params.to}`);
  } catch (error: any) {
    console.error('❌ Lỗi gửi email:', error.message);
    throw error;
  }
}

/**
 * Gửi In-App Notification qua WebSocket (FREE, không giới hạn)
 */
async function sendInAppNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    // Lưu notification vào database trước (để có ID)
    const notificationId = await saveNotificationToDatabase(params);
    
    if (!notificationId) {
      console.warn('⚠️ Không thể lưu notification vào database');
      return;
    }

    const { getIO, getConnectedUsers } = await import('./socket.js');
    const io = getIO();
    
    if (!io) {
      console.warn('⚠️ Socket.io chưa được khởi tạo');
      return;
    }

    const connectedUsers = getConnectedUsers();
    const userSocket = connectedUsers.get(params.userId);
    
    if (userSocket && userSocket.socketId) {
      // Gửi notification đến user đang online với ID từ database
      io.to(userSocket.socketId).emit('notification', {
        id: notificationId,
        title: params.title,
        message: params.message,
        type: params.type,
        priority: params.priority,
        metadata: params.metadata,
        timestamp: new Date().toISOString(),
        read: false,
      });
      console.log(`✅ Đã gửi In-App notification đến user ${params.userId}`);
    } else {
      // User offline, notification sẽ được lưu và hiển thị khi user online
      console.log(`ℹ️  User ${params.userId} đang offline. Notification đã được lưu.`);
    }
  } catch (error: any) {
    console.error('❌ Lỗi gửi In-App notification:', error.message);
    throw error;
  }
}

/**
 * Lưu notification vào database để hiển thị sau
 * @returns Notification ID
 */
async function saveNotificationToDatabase(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  metadata?: Record<string, any>;
}): Promise<string | null> {
  try {
    // Tạo bảng notifications nếu chưa có
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'system',
        priority VARCHAR(20) NOT NULL DEFAULT 'normal',
        is_read BOOLEAN DEFAULT FALSE,
        metadata JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_read (is_read),
        INDEX idx_created_at (created_at),
        INDEX idx_type (type),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const { v4: uuidv4 } = await import('uuid');
    const { toMySQLDateTime } = await import('./dataHelpers.js');

    const notificationId = uuidv4();
    await query(
      `INSERT INTO notifications (id, user_id, title, message, type, priority, is_read, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notificationId,
        params.userId,
        params.title,
        params.message,
        params.type,
        params.priority,
        false,
        params.metadata ? JSON.stringify(params.metadata) : null,
        toMySQLDateTime(),
      ]
    );
    return notificationId;
  } catch (error: any) {
    // Nếu bảng đã tồn tại hoặc có lỗi, chỉ log
    console.warn('⚠️ Lỗi lưu notification vào database:', error.message);
    return null;
  }
}

/**
 * Gửi thông báo khi được giao việc
 */
export async function sendTaskAssignmentNotification(
  assignedUserId: string,
  taskTitle: string,
  projectName: string,
  createdByName: string,
  taskId: string,
  projectId: string,
  dueDate?: string | null,
  priority?: string
): Promise<void> {
  const priorityText = priority === 'high' ? '🔴 CAO' : priority === 'low' ? '🟢 THẤP' : '🟡 BÌNH THƯỜNG';
  const dueDateText = dueDate ? `\n📅 Hạn hoàn thành: ${formatDate(dueDate)}` : '';
  
  const message = `📋 Công việc: ${taskTitle}
📁 Dự án: ${projectName}
👤 Người giao: ${createdByName}
⚡ Độ ưu tiên: ${priorityText}${dueDateText}

Vui lòng kiểm tra và bắt đầu thực hiện công việc.`;

  await sendNotification({
    userId: assignedUserId,
    title: '🔔 BẠN ĐÃ ĐƯỢC GIAO VIỆC MỚI',
    message: message,
    priority: priority as 'low' | 'normal' | 'high' || 'normal',
    type: 'task_assignment',
    metadata: {
      taskId, // Thêm taskId để link đến task
      projectId, // Thêm projectId để link đến project
      taskTitle,
      projectName,
      createdByName,
      dueDate,
      priority,
    },
  });
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

