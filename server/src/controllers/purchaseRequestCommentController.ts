import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime } from '../utils/dataHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Helper function to get comment attachment URL
function getCommentAttachmentUrl(filename: string): string {
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/purchase-request-comments/${filename}`;
}

// Configure multer for comment attachments
const commentAttachmentsDir = path.join(process.cwd(), 'uploads', 'purchase-request-comments');
if (!fs.existsSync(commentAttachmentsDir)) {
  fs.mkdirSync(commentAttachmentsDir, { recursive: true });
}

const commentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, commentAttachmentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const uploadCommentFiles = multer({
  storage: commentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
  },
});

// Get comments for a purchase request
export const getComments = async (req: Request, res: Response) => {
  try {
    const { purchaseRequestId } = req.query;

    if (!purchaseRequestId) {
      return res.status(400).json({ error: 'purchaseRequestId là bắt buộc' });
    }

    // Get comments with user names and avatars
    const comments = await query<any[]>(
      `SELECT 
        prc.*,
        u.name as created_by_name,
        u.avatar as created_by_avatar
      FROM purchase_request_comments prc
      LEFT JOIN users u ON prc.created_by = u.id
      WHERE prc.purchase_request_id = ?
      ORDER BY prc.created_at ASC`,
      [purchaseRequestId]
    );

    // Get attachments for each comment
    const commentsWithAttachments = await Promise.all(
      comments.map(async (comment) => {
        const attachments = await query<any[]>(
          'SELECT * FROM purchase_request_comment_attachments WHERE comment_id = ? ORDER BY created_at ASC',
          [comment.id]
        );

        // Convert attachments to full URLs
        const attachmentsWithUrls = attachments.map((att) => ({
          id: att.id,
          commentId: att.comment_id,
          filename: att.filename,
          originalFilename: att.original_filename,
          fileType: att.file_type,
          fileSize: att.file_size,
          fileUrl: getCommentAttachmentUrl(att.filename),
          createdAt: att.created_at,
        }));

        // Get avatar URL
        let avatarUrl = null;
        if (comment.created_by_avatar) {
          const baseUrl = process.env.API_BASE_URL || 
                          process.env.SERVER_URL || 
                          (process.env.NODE_ENV === 'production' 
                            ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                            : 'http://localhost:2222');
          avatarUrl = `${baseUrl}/uploads/avatars/${comment.created_by_avatar}`;
        }

        return {
          id: comment.id,
          purchaseRequestId: comment.purchase_request_id,
          content: comment.content,
          createdBy: comment.created_by,
          createdByName: comment.created_by_name,
          createdByAvatar: avatarUrl,
          createdAt: comment.created_at,
          updatedAt: comment.updated_at,
          attachments: attachmentsWithUrls,
        };
      })
    );

    res.json(commentsWithAttachments);
  } catch (error: any) {
    console.error('Error fetching purchase request comments:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách comment' });
  }
};

// Create a new comment
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { purchaseRequestId, content } = req.body;

    if (!purchaseRequestId) {
      return res.status(400).json({ error: 'purchaseRequestId là bắt buộc' });
    }

    if (!content && (!req.files || (req.files as Express.Multer.File[]).length === 0)) {
      return res.status(400).json({ error: 'Nội dung hoặc file đính kèm là bắt buộc' });
    }

    // Check if purchase request exists
    const purchaseRequest = await query<any[]>(
      'SELECT id FROM purchase_requests WHERE id = ?',
      [purchaseRequestId]
    );

    if (purchaseRequest.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đề xuất mua hàng' });
    }

    const commentId = uuidv4();
    const now = toMySQLDateTime();

    // Create comment
    await query(
      `INSERT INTO purchase_request_comments (
        id, purchase_request_id, content, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [commentId, purchaseRequestId, content || '', userId, now, now]
    );

    // Handle file attachments
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      for (const file of files) {
        const attachmentId = uuidv4();
        const fileUrl = getCommentAttachmentUrl(file.filename);

        await query(
          `INSERT INTO purchase_request_comment_attachments (
            id, comment_id, filename, original_filename, file_type, file_size, file_url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attachmentId,
            commentId,
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

    // Get the created comment with user info
    const created = await query<any[]>(
      `SELECT 
        prc.*,
        u.name as created_by_name,
        u.avatar as created_by_avatar
      FROM purchase_request_comments prc
      LEFT JOIN users u ON prc.created_by = u.id
      WHERE prc.id = ?`,
      [commentId]
    );

    // Get attachments
    const attachments = await query<any[]>(
      'SELECT * FROM purchase_request_comment_attachments WHERE comment_id = ? ORDER BY created_at ASC',
      [commentId]
    );

    const attachmentsWithUrls = attachments.map((att) => ({
      id: att.id,
      commentId: att.comment_id,
      filename: att.filename,
      originalFilename: att.original_filename,
      fileType: att.file_type,
      fileSize: att.file_size,
      fileUrl: getCommentAttachmentUrl(att.filename),
      createdAt: att.created_at,
    }));

    // Get avatar URL
    let avatarUrl = null;
    if (created[0].created_by_avatar) {
      const baseUrl = process.env.API_BASE_URL || 
                          process.env.SERVER_URL || 
                          (process.env.NODE_ENV === 'production' 
                            ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                            : 'http://localhost:2222');
      avatarUrl = `${baseUrl}/uploads/avatars/${created[0].created_by_avatar}`;
    }

    res.status(201).json({
      id: created[0].id,
      purchaseRequestId: created[0].purchase_request_id,
      content: created[0].content,
      createdBy: created[0].created_by,
      createdByName: created[0].created_by_name,
      createdByAvatar: avatarUrl,
      createdAt: created[0].created_at,
      updatedAt: created[0].updated_at,
      attachments: attachmentsWithUrls,
    });
  } catch (error: any) {
    console.error('Error creating purchase request comment:', error);
    res.status(500).json({ error: 'Không thể tạo comment' });
  }
};

// Update a comment
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Nội dung comment không được để trống' });
    }

    // Check if comment exists and belongs to user
    const existing = await query<any[]>(
      'SELECT * FROM purchase_request_comments WHERE id = ? AND created_by = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy comment hoặc bạn không có quyền chỉnh sửa' });
    }

    // Check if comment has attachments (cannot edit if has attachments)
    const attachments = await query<any[]>(
      'SELECT id FROM purchase_request_comment_attachments WHERE comment_id = ?',
      [id]
    );

    if (attachments.length > 0) {
      return res.status(400).json({ error: 'Không thể chỉnh sửa comment có file đính kèm' });
    }

    const now = toMySQLDateTime();

    // Update comment
    await query(
      'UPDATE purchase_request_comments SET content = ?, updated_at = ? WHERE id = ?',
      [content.trim(), now, id]
    );

    // Get updated comment
    const updated = await query<any[]>(
      `SELECT 
        prc.*,
        u.name as created_by_name,
        u.avatar as created_by_avatar
      FROM purchase_request_comments prc
      LEFT JOIN users u ON prc.created_by = u.id
      WHERE prc.id = ?`,
      [id]
    );

    // Get avatar URL
    let avatarUrl = null;
    if (updated[0].created_by_avatar) {
      const baseUrl = process.env.API_BASE_URL || 
                      process.env.SERVER_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                        : 'http://localhost:2222');
      avatarUrl = `${baseUrl}/uploads/avatars/${updated[0].created_by_avatar}`;
    }

    res.json({
      id: updated[0].id,
      purchaseRequestId: updated[0].purchase_request_id,
      content: updated[0].content,
      createdBy: updated[0].created_by,
      createdByName: updated[0].created_by_name,
      createdByAvatar: avatarUrl,
      createdAt: updated[0].created_at,
      updatedAt: updated[0].updated_at,
      attachments: [],
    });
  } catch (error: any) {
    console.error('Error updating purchase request comment:', error);
    res.status(500).json({ error: 'Không thể cập nhật comment' });
  }
};

// Delete a comment
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;

    // Check if comment exists and belongs to user
    const existing = await query<any[]>(
      'SELECT * FROM purchase_request_comments WHERE id = ? AND created_by = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy comment hoặc bạn không có quyền xóa' });
    }

    // Get attachments to delete files
    const attachments = await query<any[]>(
      'SELECT * FROM purchase_request_comment_attachments WHERE comment_id = ?',
      [id]
    );

    // Delete attachment files from disk
    for (const att of attachments) {
      const filePath = path.join(commentAttachmentsDir, att.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete comment (attachments will be deleted by CASCADE)
    await query('DELETE FROM purchase_request_comments WHERE id = ?', [id]);

    res.json({ message: 'Comment đã được xóa' });
  } catch (error: any) {
    console.error('Error deleting purchase request comment:', error);
    res.status(500).json({ error: 'Không thể xóa comment' });
  }
};

// Delete an attachment
export const deleteAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { id } = req.params;

    // Get attachment and check if comment belongs to user
    const attachment = await query<any[]>(
      `SELECT prca.*, prc.created_by 
       FROM purchase_request_comment_attachments prca
       JOIN purchase_request_comments prc ON prca.comment_id = prc.id
       WHERE prca.id = ?`,
      [id]
    );

    if (attachment.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy file đính kèm' });
    }

    if (attachment[0].created_by !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa file này' });
    }

    // Delete file from disk
    const filePath = path.join(commentAttachmentsDir, attachment[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete attachment from database
    await query('DELETE FROM purchase_request_comment_attachments WHERE id = ?', [id]);

    res.json({ message: 'File đính kèm đã được xóa' });
  } catch (error: any) {
    console.error('Error deleting purchase request comment attachment:', error);
    res.status(500).json({ error: 'Không thể xóa file đính kèm' });
  }
};

