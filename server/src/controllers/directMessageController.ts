import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { getMinutesAgoSelectQuery } from '../utils/sqlHelpers.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime } from '../utils/dataHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Helper function to get message attachment URL
function getMessageAttachmentUrl(filename: string): string {
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/direct-messages/${filename}`;
}

// Helper function to get or create conversation between two users
async function getOrCreateConversation(user1Id: string, user2Id: string): Promise<string> {
  // Validate inputs
  if (!user1Id || !user2Id) {
    throw new Error('user1Id and user2Id are required');
  }

  if (user1Id === user2Id) {
    throw new Error('Cannot create conversation with yourself');
  }

  // Ensure user1Id < user2Id for consistency
  const [u1, u2] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

  // Check if conversation exists
  const existing = await query<any[]>(
    'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?',
    [u1, u2]
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create new conversation
  const conversationId = uuidv4();
  const now = toMySQLDateTime();
  await query(
    `INSERT INTO conversations (id, user1_id, user2_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [conversationId, u1, u2, now, now]
  );

  return conversationId;
}

// Helper function to get conversation ID for two users
async function getConversationId(user1Id: string, user2Id: string): Promise<string | null> {
  const [u1, u2] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];
  const result = await query<any[]>(
    'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?',
    [u1, u2]
  );
  return result.length > 0 ? result[0].id : null;
}

// Configure multer for message attachments
const messageAttachmentsDir = path.join(process.cwd(), 'uploads', 'direct-messages');
if (!fs.existsSync(messageAttachmentsDir)) {
  fs.mkdirSync(messageAttachmentsDir, { recursive: true });
}

const messageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, messageAttachmentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const uploadMessageFiles = multer({
  storage: messageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file (reduced from 10MB for better storage efficiency)
  },
});

// Get all conversations for current user
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    // Get conversations where user is either user1 or user2
    const conversations = await query<any[]>(
      `SELECT 
        c.*,
        CASE 
          WHEN c.user1_id = ? THEN c.user2_id 
          ELSE c.user1_id 
        END as other_user_id
      FROM conversations c
      WHERE (c.user1_id = ? OR c.user2_id = ?)
        AND (CASE 
          WHEN c.user1_id = ? THEN c.user1_deleted_at IS NULL
          ELSE c.user2_deleted_at IS NULL
        END)
      ORDER BY c.updated_at DESC`,
      [userId, userId, userId, userId]
    );

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.other_user_id;

        // Get other user info
        const userResult = await query<any[]>(
          'SELECT id, name, email, avatar, status FROM users WHERE id = ?',
          [otherUserId]
        );

        if (userResult.length === 0) {
          return null;
        }

        const otherUser = userResult[0];
        let avatarUrl = null;
        if (otherUser.avatar) {
          const baseUrl = process.env.API_BASE_URL || 
                          process.env.SERVER_URL || 
                          (process.env.NODE_ENV === 'production' 
                            ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                            : 'http://localhost:2222');
          avatarUrl = `${baseUrl}/uploads/avatars/${otherUser.avatar}`;
        }

        // Get last message
        const lastMessageResult = await query<any[]>(
          `SELECT 
            dm.*,
            u.name as sender_name,
            u.avatar as sender_avatar
          FROM direct_messages dm
          LEFT JOIN users u ON dm.sender_id = u.id
          WHERE dm.conversation_id = ?
          ORDER BY dm.created_at DESC
          LIMIT 1`,
          [conv.id]
        );

        // Get unread count
        const lastReadField = conv.user1_id === userId ? 'user1_last_read_at' : 'user2_last_read_at';
        const lastReadAt = conv[lastReadField] || null;
        let unreadCount = 0;

        if (lastReadAt) {
          const unreadResult = await query<any[]>(
            `SELECT COUNT(*) as count FROM direct_messages 
             WHERE conversation_id = ? 
               AND sender_id != ? 
               AND created_at > ?`,
            [conv.id, userId, lastReadAt]
          );
          unreadCount = parseInt(unreadResult[0]?.count || '0');
        } else {
          // If never read, count all messages from other user
          const unreadResult = await query<any[]>(
            `SELECT COUNT(*) as count FROM direct_messages 
             WHERE conversation_id = ? AND sender_id != ?`,
            [conv.id, userId]
          );
          unreadCount = parseInt(unreadResult[0]?.count || '0');
        }

        return {
          id: conv.id,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email,
            avatar: avatarUrl,
            status: otherUser.status,
          },
          lastMessage: lastMessageResult[0] ? {
            id: lastMessageResult[0].id,
            content: lastMessageResult[0].content,
            senderId: lastMessageResult[0].sender_id,
            senderName: lastMessageResult[0].sender_name,
            createdAt: lastMessageResult[0].created_at,
          } : null,
          unreadCount,
          updatedAt: conv.updated_at,
          createdAt: conv.created_at,
        };
      })
    );

    // Filter out null values
    const validConversations = conversationsWithDetails.filter(c => c !== null);

    res.json(validConversations);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách trò chuyện' });
  }
};

// Get conversation by conversation ID
export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: 'Thiếu conversation ID' });
    }

    // Get conversation record
    const convResult = await query<any[]>(
      'SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );

    if (convResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện' });
    }

    const conv = convResult[0];
    const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

    // Get other user info
    const userResult = await query<any[]>(
      'SELECT id, name, email, avatar, status FROM users WHERE id = ?',
      [otherUserId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const otherUser = userResult[0];
    let avatarUrl = null;
    if (otherUser.avatar) {
      const baseUrl = process.env.API_BASE_URL || 
                      process.env.SERVER_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                        : 'http://localhost:2222');
      avatarUrl = `${baseUrl}/uploads/avatars/${otherUser.avatar}`;
    }

    const lastReadField = conv.user1_id === userId ? 'user1_last_read_at' : 'user2_last_read_at';
    const lastReadAt = conv[lastReadField] || null;

    res.json({
      id: conversationId,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        email: otherUser.email,
        avatar: avatarUrl,
        status: otherUser.status,
      },
      lastReadAt,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
    });
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin trò chuyện' });
  }
};

// Get messages for a conversation
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);

    // Verify user is part of this conversation
    const convResult = await query<any[]>(
      'SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );

    if (convResult.length === 0) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập cuộc trò chuyện này' });
    }

    // Get messages
    const messages = await query<any[]>(
      `SELECT 
        dm.*,
        u.name as sender_name,
        u.avatar as sender_avatar
      FROM direct_messages dm
      LEFT JOIN users u ON dm.sender_id = u.id
      WHERE dm.conversation_id = ?
      ORDER BY dm.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [conversationId]
    );

    // Get attachments for each message
    const messagesWithAttachments = await Promise.all(
      messages.map(async (msg) => {
        const attachments = await query<any[]>(
          'SELECT * FROM direct_message_attachments WHERE message_id = ? ORDER BY created_at ASC',
          [msg.id]
        );

        const attachmentsWithUrls = attachments.map((att) => ({
          id: att.id,
          messageId: att.message_id,
          filename: att.filename,
          originalFilename: att.original_filename,
          fileType: att.file_type,
          fileSize: att.file_size,
          fileUrl: getMessageAttachmentUrl(att.filename),
          createdAt: att.created_at,
        }));

        // Get avatar URL
        let avatarUrl = null;
        if (msg.sender_avatar) {
          const baseUrl = process.env.API_BASE_URL || 
                          process.env.SERVER_URL || 
                          (process.env.NODE_ENV === 'production' 
                            ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                            : 'http://localhost:2222');
          avatarUrl = `${baseUrl}/uploads/avatars/${msg.sender_avatar}`;
        }

        return {
          id: msg.id,
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          senderName: msg.sender_name,
          senderAvatar: avatarUrl,
          content: msg.content,
          attachments: attachmentsWithUrls,
          createdAt: msg.created_at,
          updatedAt: msg.updated_at,
        };
      })
    );

    // Update last_read_at for current user
    const conv = convResult[0];
    const now = toMySQLDateTime();
    if (conv.user1_id === userId) {
      await query(
        'UPDATE conversations SET user1_last_read_at = ?, updated_at = ? WHERE id = ?',
        [now, now, conversationId]
      );
    } else {
      await query(
        'UPDATE conversations SET user2_last_read_at = ?, updated_at = ? WHERE id = ?',
        [now, now, conversationId]
      );
    }

    res.json(messagesWithAttachments.reverse()); // Reverse to show oldest first
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Không thể lấy tin nhắn' });
  }
};

// Send message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { receiverId } = req.params;
    const { content } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: 'Thiếu ID người nhận' });
    }

    if (!content && (!req.files || (req.files as Express.Multer.File[]).length === 0)) {
      return res.status(400).json({ error: 'Nội dung hoặc file đính kèm là bắt buộc' });
    }

    if (receiverId === userId) {
      return res.status(400).json({ error: 'Không thể gửi tin nhắn cho chính mình' });
    }

    // Get or create conversation
    const conversationId = await getOrCreateConversation(userId, receiverId);

    // Verify receiver exists
    const receiverResult = await query<any[]>(
      'SELECT id FROM users WHERE id = ?',
      [receiverId]
    );

    if (receiverResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người nhận' });
    }

    const messageId = uuidv4();
    const now = toMySQLDateTime();

    // Create message
    await query(
      `INSERT INTO direct_messages (id, conversation_id, sender_id, receiver_id, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [messageId, conversationId, userId, receiverId, content || '', now, now]
    );

    // Update conversation updated_at
    await query(
      'UPDATE conversations SET updated_at = ? WHERE id = ?',
      [now, conversationId]
    );

    // Handle file attachments
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      for (const file of files) {
        const attachmentId = uuidv4();
        const fileUrl = getMessageAttachmentUrl(file.filename);

        await query(
          `INSERT INTO direct_message_attachments (
            id, message_id, filename, original_filename, file_type, file_size, file_url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attachmentId,
            messageId,
            file.filename,
            file.originalname,
            file.mimetype,
            file.size,
            fileUrl,
            now,
          ]
        );
      }
    }

    // Get created message
    const created = await query<any[]>(
      `SELECT 
        dm.*,
        u.name as sender_name,
        u.avatar as sender_avatar
      FROM direct_messages dm
      LEFT JOIN users u ON dm.sender_id = u.id
      WHERE dm.id = ?`,
      [messageId]
    );

    // Get attachments
    const attachments = await query<any[]>(
      'SELECT * FROM direct_message_attachments WHERE message_id = ? ORDER BY created_at ASC',
      [messageId]
    );

    const attachmentsWithUrls = attachments.map((att) => ({
      id: att.id,
      messageId: att.message_id,
      filename: att.filename,
      originalFilename: att.original_filename,
      fileType: att.file_type,
      fileSize: att.file_size,
      fileUrl: getMessageAttachmentUrl(att.filename),
      createdAt: att.created_at,
    }));

    // Get avatar URL
    let avatarUrl = null;
    if (created[0].sender_avatar) {
      const baseUrl = process.env.API_BASE_URL || 
                      process.env.SERVER_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                        : 'http://localhost:2222');
      avatarUrl = `${baseUrl}/uploads/avatars/${created[0].sender_avatar}`;
    }

    const message = {
      id: created[0].id,
      conversationId: created[0].conversation_id,
      senderId: created[0].sender_id,
      receiverId: created[0].receiver_id,
      senderName: created[0].sender_name,
      senderAvatar: avatarUrl,
      content: created[0].content,
      attachments: attachmentsWithUrls,
      createdAt: created[0].created_at,
      updatedAt: created[0].updated_at,
    };

    // Emit socket event for real-time update
    try {
      const { getIO, getConnectedUsers } = await import('../utils/socket.js');
      const io = getIO();
      if (io) {
        // Get receiver's socket ID from connectedUsers and emit directly to receiver only
        // Don't emit to sender - they already have the message in their UI
        const connectedUsersMap = getConnectedUsers();
        const receiverSocketUser = connectedUsersMap.get(receiverId);
        
        if (receiverSocketUser && receiverSocketUser.socketId) {
          // Emit directly to receiver's socket only (not to sender)
          io.to(receiverSocketUser.socketId).emit('direct-message-received', {
            conversationId,
            message,
          });
        }
        // If receiver is not connected, they'll get the message when they reconnect

        // Only notify receiver (not sender) about conversation update for conversation list
        const receiverUser = await query<any[]>(
          'SELECT id FROM users WHERE id = ?',
          [receiverId]
        );
        if (receiverUser.length > 0) {
          io.to(`conversation-${conversationId}`).emit('conversation-updated', {
            conversationId,
            forReceiverOnly: true,
          });
        }
      }
    } catch (socketError) {
      console.error('Error emitting socket event:', socketError);
      // Don't fail the request if socket fails
    }

    res.status(201).json(message);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Không thể gửi tin nhắn' });
  }
};

// Update message
export const updateMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Nội dung tin nhắn là bắt buộc' });
    }

    // Get message
    const messages = await query<any[]>(
      'SELECT * FROM direct_messages WHERE id = ?',
      [messageId]
    );

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tin nhắn' });
    }

    const message = messages[0];

    // Check if user is sender
    if (message.sender_id !== userId) {
      return res.status(403).json({ error: 'Bạn chỉ có thể chỉnh sửa tin nhắn của chính mình' });
    }

    // Check if message is older than 30 minutes (compatible with both MySQL and PostgreSQL)
    const timeCheckQuery = getMinutesAgoSelectQuery('created_at', 'direct_messages', 'id = ?');
    const timeCheck = await query<any[]>(timeCheckQuery, [messageId]);

    if (timeCheck.length > 0 && timeCheck[0].minutes_ago > 30) {
      return res.status(403).json({ error: 'Không thể chỉnh sửa tin nhắn sau 30 phút' });
    }

    // Check if message has attachments (can't edit messages with attachments)
    const attachments = await query<any[]>(
      'SELECT * FROM direct_message_attachments WHERE message_id = ?',
      [messageId]
    );

    if (attachments.length > 0) {
      return res.status(400).json({ error: 'Không thể chỉnh sửa tin nhắn có file đính kèm' });
    }

    const now = toMySQLDateTime();

    // Update message
    await query(
      'UPDATE direct_messages SET content = ?, updated_at = ? WHERE id = ?',
      [content, now, messageId]
    );

    // Get updated message
    const updated = await query<any[]>(
      `SELECT 
        dm.*,
        u.name as sender_name,
        u.avatar as sender_avatar
      FROM direct_messages dm
      LEFT JOIN users u ON dm.sender_id = u.id
      WHERE dm.id = ?`,
      [messageId]
    );

    // Get avatar URL
    let avatarUrl = null;
    if (updated[0].sender_avatar) {
      const baseUrl = process.env.API_BASE_URL || 
                      process.env.SERVER_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                        : 'http://localhost:2222');
      avatarUrl = `${baseUrl}/uploads/avatars/${updated[0].sender_avatar}`;
    }

    const updatedMessage = {
      id: updated[0].id,
      conversationId: updated[0].conversation_id,
      senderId: updated[0].sender_id,
      receiverId: updated[0].receiver_id,
      senderName: updated[0].sender_name,
      senderAvatar: avatarUrl,
      content: updated[0].content,
      attachments: [],
      createdAt: updated[0].created_at,
      updatedAt: updated[0].updated_at,
    };

    res.json(updatedMessage);
  } catch (error: any) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Không thể cập nhật tin nhắn' });
  }
};

// Delete message
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { messageId } = req.params;

    // Get message
    const messages = await query<any[]>(
      'SELECT * FROM direct_messages WHERE id = ?',
      [messageId]
    );

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tin nhắn' });
    }

    const message = messages[0];

    // Check if user is sender
    if (message.sender_id !== userId) {
      return res.status(403).json({ error: 'Bạn chỉ có thể xóa tin nhắn của chính mình' });
    }

    // Check if message is older than 30 minutes (compatible with both MySQL and PostgreSQL)
    const timeCheckQuery = getMinutesAgoSelectQuery('created_at', 'direct_messages', 'id = ?');
    const timeCheck = await query<any[]>(timeCheckQuery, [messageId]);

    if (timeCheck.length > 0 && timeCheck[0].minutes_ago > 30) {
      return res.status(403).json({ error: 'Không thể xóa tin nhắn sau 30 phút' });
    }

    // Get attachments to delete files
    const attachments = await query<any[]>(
      'SELECT * FROM direct_message_attachments WHERE message_id = ?',
      [messageId]
    );

    // Delete attachment files from disk
    for (const att of attachments) {
      const filePath = path.join(messageAttachmentsDir, att.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete message (attachments will be deleted by CASCADE)
    await query('DELETE FROM direct_messages WHERE id = ?', [messageId]);

    res.json({ message: 'Tin nhắn đã được xóa' });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Không thể xóa tin nhắn' });
  }
};

// Delete conversation
export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { conversationId } = req.params;

    // Get conversation
    const convResult = await query<any[]>(
      'SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, userId, userId]
    );

    if (convResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện' });
    }

    const conv = convResult[0];
    const now = toMySQLDateTime();

    // Mark conversation as deleted for current user
    if (conv.user1_id === userId) {
      await query(
        'UPDATE conversations SET user1_deleted_at = ?, updated_at = ? WHERE id = ?',
        [now, now, conversationId]
      );
    } else {
      await query(
        'UPDATE conversations SET user2_deleted_at = ?, updated_at = ? WHERE id = ?',
        [now, now, conversationId]
      );
    }

    res.json({ message: 'Cuộc trò chuyện đã được xóa' });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Không thể xóa cuộc trò chuyện' });
  }
};

