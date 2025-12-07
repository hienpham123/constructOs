import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime } from '../utils/dataHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { ProjectComment, CommentAttachment } from '../types/index.js';
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
  
  return `${baseUrl}/uploads/comments/${filename}`;
}

// Configure multer for comment attachments
const commentAttachmentsDir = path.join(process.cwd(), 'uploads', 'comments');
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

// Get comments for a project and category
export const getComments = async (req: Request, res: Response) => {
  try {
    const { projectId, category, limit, offset } = req.query;

    if (!projectId || !category) {
      return res.status(400).json({ error: 'projectId và category là bắt buộc' });
    }

    if (category !== 'contract' && category !== 'project_files') {
      return res.status(400).json({ error: 'category phải là contract hoặc project_files' });
    }

    // Parse pagination params
    const limitNum = limit ? parseInt(limit as string, 10) : 50;
    const offsetNum = offset ? parseInt(offset as string, 10) : 0;

    // Get comments with user names and avatars
    const comments = await query<any[]>(
      `SELECT 
        pc.*,
        u.name as created_by_name,
        u.avatar as created_by_avatar
      FROM project_comments pc
      LEFT JOIN users u ON pc.created_by = u.id
      WHERE pc.project_id = ? AND pc.category = ?
      ORDER BY pc.created_at ASC
      LIMIT ${limitNum} OFFSET ${offsetNum}`,
      [projectId, category]
    );

    // Get attachments for each comment
    const commentsWithAttachments = await Promise.all(
      comments.map(async (comment) => {
        const attachments = await query<any[]>(
          'SELECT * FROM comment_attachments WHERE comment_id = ? ORDER BY created_at ASC',
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
          projectId: comment.project_id,
          category: comment.category,
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
    console.error('Error fetching comments:', error);
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

    const { projectId, category, content } = req.body;

    if (!projectId || !category) {
      return res.status(400).json({ error: 'projectId và category là bắt buộc' });
    }

    // Content or files must be provided
    const hasContent = content && content.trim().length > 0;
    const hasFiles = req.files && Array.isArray(req.files) && req.files.length > 0;
    
    if (!hasContent && !hasFiles) {
      return res.status(400).json({ error: 'Phải có nội dung hoặc file đính kèm' });
    }

    if (category !== 'contract' && category !== 'project_files') {
      return res.status(400).json({ error: 'category phải là contract hoặc project_files' });
    }

    // Verify project exists
    const project = await query<any[]>(
      'SELECT id FROM projects WHERE id = ?',
      [projectId]
    );

    if (project.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy dự án' });
    }

    const commentId = uuidv4();
    const createdAt = toMySQLDateTime();

    // Create comment (content can be empty if there are files)
    await query(
      `INSERT INTO project_comments (id, project_id, category, content, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [commentId, projectId, category, content || '', userId, createdAt, createdAt]
    );

    // Handle file attachments if any
    let attachments: CommentAttachment[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const files = req.files as Express.Multer.File[];
      
      for (const file of files) {
        const attachmentId = uuidv4();
        const fileUrl = getCommentAttachmentUrl(file.filename);

        await query(
          `INSERT INTO comment_attachments (id, comment_id, filename, original_filename, file_type, file_size, file_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attachmentId,
            commentId,
            file.filename,
            file.originalname,
            file.mimetype,
            file.size,
            fileUrl,
            createdAt,
          ]
        );

        attachments.push({
          id: attachmentId,
          commentId,
          filename: file.filename,
          originalFilename: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          fileUrl,
          createdAt,
        });
      }
    }

    // Get user name
    const user = await query<any[]>(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );

    // Get user avatar
    let avatarUrl = null;
    if (user.length > 0 && user[0].avatar) {
      const baseUrl = process.env.API_BASE_URL || 
                      process.env.SERVER_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                        : 'http://localhost:2222');
      avatarUrl = `${baseUrl}/uploads/avatars/${user[0].avatar}`;
    }

    const newComment: ProjectComment = {
      id: commentId,
      projectId,
      category: category as 'contract' | 'project_files',
      content: content || '',
      createdBy: userId,
      createdByName: user.length > 0 ? user[0].name : '',
      createdByAvatar: avatarUrl,
      createdAt,
      updatedAt: createdAt,
      attachments,
    };

    res.status(201).json(newComment);
  } catch (error: any) {
    console.error('Error creating comment:', error);
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

    // Get comment to check ownership
    const comment = await query<any[]>(
      'SELECT * FROM project_comments WHERE id = ?',
      [id]
    );

    if (comment.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy comment' });
    }

    // Check if user is the creator
    if (comment[0].created_by !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa comment này' });
    }

    const updatedAt = toMySQLDateTime();

    // Update comment
    await query(
      'UPDATE project_comments SET content = ?, updated_at = ? WHERE id = ?',
      [content.trim(), updatedAt, id]
    );

    // Get updated comment with user info
    const updated = await query<any[]>(
      `SELECT 
        pc.*,
        u.name as created_by_name,
        u.avatar as created_by_avatar
      FROM project_comments pc
      LEFT JOIN users u ON pc.created_by = u.id
      WHERE pc.id = ?`,
      [id]
    );

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy comment sau khi cập nhật' });
    }

    // Get attachments
    const attachments = await query<any[]>(
      'SELECT * FROM comment_attachments WHERE comment_id = ? ORDER BY created_at ASC',
      [id]
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
    if (updated[0].created_by_avatar) {
      const baseUrl = process.env.API_BASE_URL || 
                      process.env.SERVER_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                        : 'http://localhost:2222');
      avatarUrl = `${baseUrl}/uploads/avatars/${updated[0].created_by_avatar}`;
    }

    const updatedComment: ProjectComment = {
      id: updated[0].id,
      projectId: updated[0].project_id,
      category: updated[0].category as 'contract' | 'project_files',
      content: updated[0].content,
      createdBy: updated[0].created_by,
      createdByName: updated[0].created_by_name,
      createdByAvatar: avatarUrl,
      createdAt: updated[0].created_at,
      updatedAt: updated[0].updated_at,
      attachments: attachmentsWithUrls,
    };

    res.json(updatedComment);
  } catch (error: any) {
    console.error('Error updating comment:', error);
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

    // Get comment to check ownership
    const comment = await query<any[]>(
      'SELECT * FROM project_comments WHERE id = ?',
      [id]
    );

    if (comment.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy comment' });
    }

    // Check if user is the creator (or admin - you can add admin check here)
    if (comment[0].created_by !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa comment này' });
    }

    // Get attachments to delete files
    const attachments = await query<any[]>(
      'SELECT * FROM comment_attachments WHERE comment_id = ?',
      [id]
    );

    // Delete attachment files
    for (const att of attachments) {
      try {
        const filePath = path.join(commentAttachmentsDir, att.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError: any) {
        console.error(`Error deleting file ${att.filename}:`, fileError);
      }
    }

    // Delete comment (attachments will be deleted by CASCADE)
    await query('DELETE FROM project_comments WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Không thể xóa comment' });
  }
};

