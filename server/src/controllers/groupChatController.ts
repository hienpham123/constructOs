import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { getMinutesAgoSelectQuery } from '../utils/sqlHelpers.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime } from '../utils/dataHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Helper function to get group avatar URL
function getGroupAvatarUrl(filename: string): string {
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/group-avatars/${filename}`;
}

// Helper function to get message attachment URL
function getMessageAttachmentUrl(filename: string): string {
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/group-messages/${filename}`;
}

// Configure multer for group avatars
const groupAvatarsDir = path.join(process.cwd(), 'uploads', 'group-avatars');
if (!fs.existsSync(groupAvatarsDir)) {
  fs.mkdirSync(groupAvatarsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, groupAvatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const uploadGroupAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max (reduced from 5MB for better storage efficiency)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh'));
  },
});

// Configure multer for message attachments
const messageAttachmentsDir = path.join(process.cwd(), 'uploads', 'group-messages');
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

// Get all groups for current user
export const getGroups = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    // Get groups user is member of
    // First get group IDs user is member of
    const userGroups = await query<any[]>(
      `SELECT 
        gc.*,
        gm.pinned,
        gm.pinned_at
      FROM group_chats gc
      INNER JOIN group_members gm ON gc.id = gm.group_id
      WHERE gm.user_id = ?`,
      [userId]
    );

    // Then get details for each group
    const groups = await Promise.all(
      userGroups.map(async (ug) => {
        // Get member count
        const memberCountResult = await query<any[]>(
          'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
          [ug.id]
        );
        const memberCount = parseInt(memberCountResult[0]?.count || '0');

        // Get last message time
        const lastMessageResult = await query<any[]>(
          'SELECT MAX(created_at) as last_message_at FROM group_messages WHERE group_id = ?',
          [ug.id]
        );
        const lastMessageAt = lastMessageResult[0]?.last_message_at || null;

        return {
          ...ug,
          member_count: memberCount,
          last_message_at: lastMessageAt,
        };
      })
    );

    // Sort groups
    groups.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.last_message_at && b.last_message_at) {
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      }
      if (a.last_message_at) return -1;
      if (b.last_message_at) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const groupsWithDetails = await Promise.all(
      groups.map(async (group) => {
        let avatarUrl = null;
        if (group.avatar) {
          avatarUrl = getGroupAvatarUrl(group.avatar);
        }

        // Get last message
        const lastMessage = await query<any[]>(
          `SELECT 
            gmsg.*,
            u.name as user_name,
            u.avatar as user_avatar
          FROM group_messages gmsg
          LEFT JOIN users u ON gmsg.user_id = u.id
          WHERE gmsg.group_id = ?
          ORDER BY gmsg.created_at DESC
          LIMIT 1`,
          [group.id]
        );

        // Get unread count for this user
        const memberInfo = await query<any[]>(
          `SELECT last_read_at FROM group_members 
           WHERE group_id = ? AND user_id = ?`,
          [group.id, userId]
        );

        const lastReadAt = memberInfo[0]?.last_read_at || null;
        let unreadCount = 0;
        if (lastReadAt) {
          const unreadResult = await query<any[]>(
            `SELECT COUNT(*) as count FROM group_messages 
             WHERE group_id = ? AND created_at > ?`,
            [group.id, lastReadAt]
          );
          unreadCount = parseInt(unreadResult[0]?.count || '0');
        } else {
          // If never read, count all messages
          const unreadResult = await query<any[]>(
            `SELECT COUNT(*) as count FROM group_messages WHERE group_id = ?`,
            [group.id]
          );
          unreadCount = parseInt(unreadResult[0]?.count || '0');
        }

        return {
          id: group.id,
          name: group.name,
          avatar: avatarUrl,
          description: group.description,
          createdBy: group.created_by,
          memberCount: parseInt(group.member_count) || 0,
          unreadCount: unreadCount || 0,
          lastMessageAt: group.last_message_at,
          pinned: group.pinned ? true : false,
          pinnedAt: group.pinned_at,
          lastMessage: lastMessage[0] ? {
            id: lastMessage[0].id,
            content: lastMessage[0].content,
            userName: lastMessage[0].user_name,
            createdAt: lastMessage[0].created_at,
          } : null,
          createdAt: group.created_at,
          updatedAt: group.updated_at,
        };
      })
    );

    res.json(groupsWithDetails);
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách nhóm' });
  }
};

// Get group by ID
export const getGroupById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;

    // Check if user is member
    const member = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Bạn không phải thành viên của nhóm này' });
    }

    // Get group info
    const groups = await query<any[]>(
      'SELECT * FROM group_chats WHERE id = ?',
      [id]
    );

    if (groups.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhóm' });
    }

    const group = groups[0];

    // Get members
    const members = await query<any[]>(
      `SELECT 
        gm.*,
        u.name,
        u.email,
        u.avatar,
        u.phone
      FROM group_members gm
      LEFT JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY 
        CASE gm.role
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          ELSE 3
        END,
        gm.joined_at ASC`,
      [id]
    );

    // Get pinned status for current user
    const userMember = await query<any[]>(
      'SELECT pinned, pinned_at FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    let avatarUrl = null;
    if (group.avatar) {
      avatarUrl = getGroupAvatarUrl(group.avatar);
    }

    const membersWithAvatars = members.map((m) => {
      let userAvatarUrl = null;
      if (m.avatar) {
        const baseUrl = process.env.API_BASE_URL || 
                        process.env.SERVER_URL || 
                        (process.env.NODE_ENV === 'production' 
                          ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                          : 'http://localhost:2222');
        userAvatarUrl = `${baseUrl}/uploads/avatars/${m.avatar}`;
      }

      return {
        id: m.id,
        userId: m.user_id,
        groupId: m.group_id,
        role: m.role,
        name: m.name,
        email: m.email,
        phone: m.phone,
        avatar: userAvatarUrl,
        joinedAt: m.joined_at,
        lastReadAt: m.last_read_at,
      };
    });

    res.json({
      id: group.id,
      name: group.name,
      avatar: avatarUrl,
      description: group.description,
      createdBy: group.created_by,
      members: membersWithAvatars,
      pinned: userMember[0]?.pinned ? true : false,
      pinnedAt: userMember[0]?.pinned_at || null,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
    });
  } catch (error: any) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin nhóm' });
  }
};

// Create new group
export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { name, description } = req.body;
    // Handle memberIds from FormData
    // FormData with [] notation creates an array, but Express might parse it differently
    let memberIds: string[] = [];
    if (req.body.memberIds) {
      if (Array.isArray(req.body.memberIds)) {
        memberIds = req.body.memberIds;
      } else if (typeof req.body.memberIds === 'string') {
        // Single value
        memberIds = [req.body.memberIds];
      }
    }
    // Also check for memberIds[] format
    if (req.body['memberIds[]']) {
      if (Array.isArray(req.body['memberIds[]'])) {
        memberIds = req.body['memberIds[]'];
      } else {
        memberIds = [req.body['memberIds[]']];
      }
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tên nhóm là bắt buộc' });
    }

    const groupId = uuidv4();
    const now = toMySQLDateTime();

    // Handle avatar upload
    let avatarFilename = null;
    if (req.file) {
      avatarFilename = req.file.filename;
    }

    // Create group
    await query(
      `INSERT INTO group_chats (id, name, avatar, description, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [groupId, name.trim(), avatarFilename, description || null, userId, now, now]
    );

    // Add creator as owner
    await query(
      `INSERT INTO group_members (id, group_id, user_id, role, joined_at)
       VALUES (?, ?, ?, 'owner', ?)`,
      [uuidv4(), groupId, userId, now]
    );

    // Add other members
    // Handle both array format and string format from FormData
    let memberIdsArray: string[] = [];
    if (memberIds) {
      if (Array.isArray(memberIds)) {
        memberIdsArray = memberIds;
      } else if (typeof memberIds === 'string') {
        // FormData might send as string, try to parse
        try {
          memberIdsArray = JSON.parse(memberIds);
        } catch {
          memberIdsArray = [memberIds];
        }
      }
    }

    if (memberIdsArray.length > 0) {
      const uniqueMemberIds = [...new Set(memberIdsArray.filter((id: string) => id && id !== userId))];
      for (const memberId of uniqueMemberIds) {
        await query(
          `INSERT INTO group_members (id, group_id, user_id, role, joined_at)
           VALUES (?, ?, ?, 'member', ?)`,
          [uuidv4(), groupId, memberId, now]
        );
      }
    }

    // Get created group
    const created = await query<any[]>(
      'SELECT * FROM group_chats WHERE id = ?',
      [groupId]
    );

    let avatarUrl = null;
    if (created[0].avatar) {
      avatarUrl = getGroupAvatarUrl(created[0].avatar);
    }

    res.status(201).json({
      id: created[0].id,
      name: created[0].name,
      avatar: avatarUrl,
      description: created[0].description,
      createdBy: created[0].created_by,
      createdAt: created[0].created_at,
      updatedAt: created[0].updated_at,
    });
  } catch (error: any) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Không thể tạo nhóm' });
  }
};

// Update group
export const updateGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    // Check if user is owner or admin
    const member = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role IN ("owner", "admin")',
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa nhóm này' });
    }

    const now = toMySQLDateTime();
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description || null);
    }

    // Handle avatar upload
    if (req.file) {
      // Get old avatar to delete
      const group = await query<any[]>(
        'SELECT avatar FROM group_chats WHERE id = ?',
        [id]
      );
      if (group[0]?.avatar) {
        const oldAvatarPath = path.join(groupAvatarsDir, group[0].avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      updates.push('avatar = ?');
      values.push(req.file.filename);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Không có thay đổi nào' });
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await query(
      `UPDATE group_chats SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated group
    const updated = await query<any[]>(
      'SELECT * FROM group_chats WHERE id = ?',
      [id]
    );

    let avatarUrl = null;
    if (updated[0].avatar) {
      avatarUrl = getGroupAvatarUrl(updated[0].avatar);
    }

    res.json({
      id: updated[0].id,
      name: updated[0].name,
      avatar: avatarUrl,
      description: updated[0].description,
      createdBy: updated[0].created_by,
      createdAt: updated[0].created_at,
      updatedAt: updated[0].updated_at,
    });
  } catch (error: any) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Không thể cập nhật nhóm' });
  }
};

// Delete group
export const deleteGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;

    // Check if user is owner
    const member = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = "owner"',
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Chỉ chủ nhóm mới có quyền xóa nhóm' });
    }

    // Get avatar to delete
    const group = await query<any[]>(
      'SELECT avatar FROM group_chats WHERE id = ?',
      [id]
    );
    if (group[0]?.avatar) {
      const avatarPath = path.join(groupAvatarsDir, group[0].avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Delete group (cascade will delete members and messages)
    await query('DELETE FROM group_chats WHERE id = ?', [id]);

    res.json({ message: 'Nhóm đã được xóa' });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Không thể xóa nhóm' });
  }
};

// Add members to group
export const addMembers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { memberIds } = req.body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: 'Danh sách thành viên là bắt buộc' });
    }

    // Check if user is owner or admin
    const member = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role IN ("owner", "admin")',
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Bạn không có quyền thêm thành viên' });
    }

    const now = toMySQLDateTime();
    const addedMembers = [];

    for (const memberId of memberIds) {
      // Check if already member
      const existing = await query<any[]>(
        'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
        [id, memberId]
      );

      if (existing.length === 0) {
        await query(
          `INSERT INTO group_members (id, group_id, user_id, role, joined_at)
           VALUES (?, ?, ?, 'member', ?)`,
          [uuidv4(), id, memberId, now]
        );
        addedMembers.push(memberId);
      }
    }

    res.json({ message: `Đã thêm ${addedMembers.length} thành viên`, addedMembers });
  } catch (error: any) {
    console.error('Error adding members:', error);
    res.status(500).json({ error: 'Không thể thêm thành viên' });
  }
};

// Remove member from group
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id, memberId } = req.params;

    // Check if user is owner or admin, or removing themselves
    const member = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Bạn không phải thành viên của nhóm này' });
    }

    const isOwnerOrAdmin = member[0].role === 'owner' || member[0].role === 'admin';
    const isRemovingSelf = memberId === userId;

    if (!isOwnerOrAdmin && !isRemovingSelf) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa thành viên này' });
    }

    // Cannot remove owner
    const targetMember = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, memberId]
    );

    if (targetMember.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thành viên' });
    }

    if (targetMember[0].role === 'owner') {
      return res.status(403).json({ error: 'Không thể xóa chủ nhóm' });
    }

    await query(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, memberId]
    );

    res.json({ message: 'Đã xóa thành viên khỏi nhóm' });
  } catch (error: any) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Không thể xóa thành viên' });
  }
};

// Transfer ownership
export const transferOwnership = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      return res.status(400).json({ error: 'ID chủ nhóm mới là bắt buộc' });
    }

    // Check if user is owner
    const member = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = "owner"',
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Chỉ chủ nhóm mới có quyền chuyển quyền' });
    }

    // Check if new owner is member
    const newOwner = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, newOwnerId]
    );

    if (newOwner.length === 0) {
      return res.status(404).json({ error: 'Người dùng không phải thành viên của nhóm' });
    }

    // Transfer ownership
    await query(
      'UPDATE group_members SET role = "member" WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );
    await query(
      'UPDATE group_members SET role = "owner" WHERE group_id = ? AND user_id = ?',
      [id, newOwnerId]
    );

    res.json({ message: 'Đã chuyển quyền chủ nhóm' });
  } catch (error: any) {
    console.error('Error transferring ownership:', error);
    res.status(500).json({ error: 'Không thể chuyển quyền chủ nhóm' });
  }
};

// Get messages for a group
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate limit and offset to prevent SQL injection
    const safeLimit = Math.max(1, Math.min(limit, 100)); // Between 1 and 100
    const safeOffset = Math.max(0, offset); // Must be >= 0

    // Check if user is member
    const member = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Bạn không phải thành viên của nhóm này' });
    }

    // Get messages
    // Note: MySQL2 doesn't support LIMIT ? OFFSET ? in prepared statements
    // So we use string interpolation after validating the values are numbers
    const messages = await query<any[]>(
      `SELECT 
        gmsg.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM group_messages gmsg
      LEFT JOIN users u ON gmsg.user_id = u.id
      WHERE gmsg.group_id = ?
      ORDER BY gmsg.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [id]
    );

    // Get attachments for each message
    const messagesWithAttachments = await Promise.all(
      messages.map(async (msg) => {
        const attachments = await query<any[]>(
          'SELECT * FROM group_message_attachments WHERE message_id = ? ORDER BY created_at ASC',
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
        if (msg.user_avatar) {
          const baseUrl = process.env.API_BASE_URL || 
                          process.env.SERVER_URL || 
                          (process.env.NODE_ENV === 'production' 
                            ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                            : 'http://localhost:2222');
          avatarUrl = `${baseUrl}/uploads/avatars/${msg.user_avatar}`;
        }

        return {
          id: msg.id,
          groupId: msg.group_id,
          userId: msg.user_id,
          userName: msg.user_name,
          userAvatar: avatarUrl,
          content: msg.content,
          attachments: attachmentsWithUrls,
          createdAt: msg.created_at,
          updatedAt: msg.updated_at,
        };
      })
    );

    // Update last_read_at
    const now = toMySQLDateTime();
    await query(
      'UPDATE group_members SET last_read_at = ? WHERE group_id = ? AND user_id = ?',
      [now, id, userId]
    );

    res.json(messagesWithAttachments.reverse()); // Reverse to show oldest first
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Không thể lấy tin nhắn' });
  }
};

// Search messages
export const searchMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { query: searchQueryParam, senderId, startDate, endDate, limit, offset } = req.query;

    // Check if user is member
    const member = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Bạn không phải thành viên của nhóm này' });
    }

    // Parse pagination params
    const limitNum = limit ? parseInt(limit as string, 10) : 50;
    const offsetNum = offset ? parseInt(offset as string, 10) : 0;

    // Build WHERE clause
    const conditions: string[] = ['gmsg.group_id = ?'];
    const params: any[] = [id];

    // Search by content
    const searchQuery = typeof searchQueryParam === 'string' ? searchQueryParam.trim() : '';
    if (searchQuery) {
      conditions.push('gmsg.content LIKE ?');
      params.push(`%${searchQuery}%`);
    }

    // Filter by sender
    if (senderId) {
      conditions.push('gmsg.user_id = ?');
      params.push(senderId);
    }

    // Filter by date range
    if (startDate) {
      conditions.push('gmsg.created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('gmsg.created_at <= ?');
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get messages
    const messages = await query<any[]>(
      `SELECT 
        gmsg.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM group_messages gmsg
      LEFT JOIN users u ON gmsg.user_id = u.id
      ${whereClause}
      ORDER BY gmsg.created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}`,
      params
    );

    // Get attachments for each message
    const messagesWithAttachments = await Promise.all(
      messages.map(async (msg: any) => {
        const attachments = await query<any[]>(
          'SELECT * FROM group_message_attachments WHERE message_id = ? ORDER BY created_at ASC',
          [msg.id]
        );

        const attachmentsWithUrls = attachments.map((att: any) => ({
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
        if (msg.user_avatar) {
          const baseUrl = process.env.API_BASE_URL || 
                          process.env.SERVER_URL || 
                          (process.env.NODE_ENV === 'production' 
                            ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                            : 'http://localhost:2222');
          avatarUrl = `${baseUrl}/uploads/avatars/${msg.user_avatar}`;
        }

        return {
          id: msg.id,
          groupId: msg.group_id,
          userId: msg.user_id,
          userName: msg.user_name,
          userAvatar: avatarUrl,
          content: msg.content,
          attachments: attachmentsWithUrls,
          createdAt: msg.created_at,
          updatedAt: msg.updated_at,
        };
      })
    );

    res.json(messagesWithAttachments);
  } catch (error: any) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Không thể tìm kiếm tin nhắn' });
  }
};

// Send message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { content } = req.body;

    if (!content && (!req.files || (req.files as Express.Multer.File[]).length === 0)) {
      return res.status(400).json({ error: 'Nội dung hoặc file đính kèm là bắt buộc' });
    }

    // Check if user is member
    const member = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Bạn không phải thành viên của nhóm này' });
    }

    const messageId = uuidv4();
    const now = toMySQLDateTime();

    // Create message
    await query(
      `INSERT INTO group_messages (id, group_id, user_id, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [messageId, id, userId, content || '', now, now]
    );

    // Handle file attachments
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      for (const file of files) {
        const attachmentId = uuidv4();
        const fileUrl = getMessageAttachmentUrl(file.filename);

        await query(
          `INSERT INTO group_message_attachments (
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
        gmsg.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM group_messages gmsg
      LEFT JOIN users u ON gmsg.user_id = u.id
      WHERE gmsg.id = ?`,
      [messageId]
    );

    // Get attachments
    const attachments = await query<any[]>(
      'SELECT * FROM group_message_attachments WHERE message_id = ? ORDER BY created_at ASC',
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
    if (created[0].user_avatar) {
      const baseUrl = process.env.API_BASE_URL || 
                      process.env.SERVER_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                        : 'http://localhost:2222');
      avatarUrl = `${baseUrl}/uploads/avatars/${created[0].user_avatar}`;
    }

    const message = {
      id: created[0].id,
      groupId: created[0].group_id,
      userId: created[0].user_id,
      userName: created[0].user_name,
      userAvatar: avatarUrl,
      content: created[0].content,
      attachments: attachmentsWithUrls,
      createdAt: created[0].created_at,
      updatedAt: created[0].updated_at,
    };

    // Emit socket event for real-time update (broadcast to other members, not sender)
    // Socket handler in socket.ts will handle the actual broadcast
    // We just need to trigger the socket handler
    // The socket handler already uses socket.to() to exclude sender
    
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
      'SELECT * FROM group_messages WHERE id = ?',
      [messageId]
    );

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tin nhắn' });
    }

    const message = messages[0];

    // Check if user is sender
    if (message.user_id !== userId) {
      return res.status(403).json({ error: 'Bạn chỉ có thể chỉnh sửa tin nhắn của chính mình' });
    }

    // Check if message is older than 30 minutes (compatible with both MySQL and PostgreSQL)
    const timeCheckQuery = getMinutesAgoSelectQuery('created_at', 'group_messages', 'id = ?');
    const timeCheck = await query<any[]>(timeCheckQuery, [messageId]);

    if (timeCheck.length > 0 && timeCheck[0].minutes_ago > 30) {
      return res.status(403).json({ error: 'Không thể chỉnh sửa tin nhắn sau 30 phút' });
    }

    // Check if message has attachments (can't edit messages with attachments)
    const attachments = await query<any[]>(
      'SELECT * FROM group_message_attachments WHERE message_id = ?',
      [messageId]
    );

    if (attachments.length > 0) {
      return res.status(400).json({ error: 'Không thể chỉnh sửa tin nhắn có file đính kèm' });
    }

    const now = toMySQLDateTime();

    // Update message
    await query(
      'UPDATE group_messages SET content = ?, updated_at = ? WHERE id = ?',
      [content, now, messageId]
    );

    // Get updated message
    const updated = await query<any[]>(
      `SELECT 
        gmsg.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM group_messages gmsg
      LEFT JOIN users u ON gmsg.user_id = u.id
      WHERE gmsg.id = ?`,
      [messageId]
    );

    // Get avatar URL
    let avatarUrl = null;
    if (updated[0].user_avatar) {
      const baseUrl = process.env.API_BASE_URL || 
                      process.env.SERVER_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                        : 'http://localhost:2222');
      avatarUrl = `${baseUrl}/uploads/avatars/${updated[0].user_avatar}`;
    }

    const updatedMessage = {
      id: updated[0].id,
      groupId: updated[0].group_id,
      userId: updated[0].user_id,
      userName: updated[0].user_name,
      userAvatar: avatarUrl,
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
      'SELECT * FROM group_messages WHERE id = ?',
      [messageId]
    );

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tin nhắn' });
    }

    const message = messages[0];

    // Check if user is sender or admin/owner
    const member = await query<any[]>(
      `SELECT gm.* FROM group_members gm
       WHERE gm.group_id = ? AND gm.user_id = ? AND gm.role IN ('owner', 'admin')`,
      [message.group_id, userId]
    );

    const isSender = message.user_id === userId;
    const isAdminOrOwner = member.length > 0;

    if (!isSender && !isAdminOrOwner) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa tin nhắn này' });
    }

    // Check if message is older than 30 minutes (only for sender, admin/owner can always delete) (compatible with both MySQL and PostgreSQL)
    if (isSender && !isAdminOrOwner) {
      const timeCheckQuery = getMinutesAgoSelectQuery('created_at', 'group_messages', 'id = ?');
      const timeCheck = await query<any[]>(timeCheckQuery, [messageId]);

      if (timeCheck.length > 0 && timeCheck[0].minutes_ago > 30) {
        return res.status(403).json({ error: 'Không thể xóa tin nhắn sau 30 phút' });
      }
    }

    // Get attachments to delete files
    const attachments = await query<any[]>(
      'SELECT * FROM group_message_attachments WHERE message_id = ?',
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
    await query('DELETE FROM group_messages WHERE id = ?', [messageId]);

    res.json({ message: 'Tin nhắn đã được xóa' });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Không thể xóa tin nhắn' });
  }
};

// Pin/Unpin group
export const togglePinGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;

    // Check if user is member
    const member = await query<any[]>(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Bạn không phải thành viên của nhóm này' });
    }

    const currentPinned = member[0].pinned ? true : false;
    const newPinned = !currentPinned;
    const now = toMySQLDateTime();

    await query(
      `UPDATE group_members 
       SET pinned = ?, pinned_at = ? 
       WHERE group_id = ? AND user_id = ?`,
      [newPinned, newPinned ? now : null, id, userId]
    );

    res.json({ 
      message: newPinned ? 'Đã ghim nhóm' : 'Đã bỏ ghim nhóm',
      pinned: newPinned 
    });
  } catch (error: any) {
    console.error('Error toggling pin:', error);
    res.status(500).json({ error: 'Không thể thay đổi trạng thái ghim' });
  }
};

