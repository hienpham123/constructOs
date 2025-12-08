import { Request, Response } from 'express';
import { query } from '../config/db.js';

// Helper function to get file URL based on type
function getFileUrl(type: string, filename: string): string {
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/${type}/${filename}`;
}

// Get all uploaded files from all tables
export const getAllFiles = async (req: Request, res: Response) => {
  try {
    const { type, limit = 100, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 100, 500); // Max 500
    const offsetNum = Math.max(parseInt(offset as string) || 0, 0);

    const allFiles: any[] = [];

    // 1. User avatars
    if (!type || type === 'avatars') {
      const users = await query<any[]>(
        'SELECT id, name, email, avatar, created_at FROM users WHERE avatar IS NOT NULL AND avatar != ? LIMIT ? OFFSET ?',
        ['', limitNum, offsetNum]
      );
      
      users.forEach((user) => {
        allFiles.push({
          id: user.id,
          type: 'avatar',
          category: 'users',
          filename: user.avatar,
          originalFilename: user.avatar,
          fileUrl: getFileUrl('avatars', user.avatar),
          relatedId: user.id,
          relatedName: user.name,
          createdAt: user.created_at,
        });
      });
    }

    // 2. Transaction attachments
    if (!type || type === 'transactions') {
      const attachments = await query<any[]>(
        `SELECT ta.*, mt.id as transaction_id, mt.type as transaction_type 
         FROM transaction_attachments ta
         LEFT JOIN material_transactions mt ON ta.transaction_id = mt.id
         ORDER BY ta.created_at DESC
         LIMIT ? OFFSET ?`,
        [limitNum, offsetNum]
      );
      
      attachments.forEach((att) => {
        allFiles.push({
          id: att.id,
          type: 'attachment',
          category: 'transactions',
          filename: att.filename,
          originalFilename: att.original_filename,
          fileType: att.file_type,
          fileSize: att.file_size,
          fileUrl: att.file_url || getFileUrl('transactions', att.filename),
          relatedId: att.transaction_id,
          createdAt: att.created_at,
        });
      });
    }

    // 3. Project comment attachments
    if (!type || type === 'comments') {
      const attachments = await query<any[]>(
        `SELECT ca.*, pc.id as comment_id, pc.content as comment_content
         FROM comment_attachments ca
         LEFT JOIN project_comments pc ON ca.comment_id = pc.id
         ORDER BY ca.created_at DESC
         LIMIT ? OFFSET ?`,
        [limitNum, offsetNum]
      );
      
      attachments.forEach((att) => {
        allFiles.push({
          id: att.id,
          type: 'attachment',
          category: 'project-comments',
          filename: att.filename,
          originalFilename: att.original_filename,
          fileType: att.file_type,
          fileSize: att.file_size,
          fileUrl: att.file_url || getFileUrl('comments', att.filename),
          relatedId: att.comment_id,
          createdAt: att.created_at,
        });
      });
    }

    // 4. Purchase request comment attachments
    if (!type || type === 'purchase-request-comments') {
      const attachments = await query<any[]>(
        `SELECT prca.*, prc.id as comment_id, prc.content as comment_content
         FROM purchase_request_comment_attachments prca
         LEFT JOIN purchase_request_comments prc ON prca.comment_id = prc.id
         ORDER BY prca.created_at DESC
         LIMIT ? OFFSET ?`,
        [limitNum, offsetNum]
      );
      
      attachments.forEach((att) => {
        allFiles.push({
          id: att.id,
          type: 'attachment',
          category: 'purchase-request-comments',
          filename: att.filename,
          originalFilename: att.original_filename,
          fileType: att.file_type,
          fileSize: att.file_size,
          fileUrl: att.file_url || getFileUrl('purchase-request-comments', att.filename),
          relatedId: att.comment_id,
          createdAt: att.created_at,
        });
      });
    }

    // 5. Group chat avatars
    if (!type || type === 'group-avatars') {
      const groups = await query<any[]>(
        'SELECT id, name, avatar, created_at FROM group_chats WHERE avatar IS NOT NULL AND avatar != ? LIMIT ? OFFSET ?',
        ['', limitNum, offsetNum]
      );
      
      groups.forEach((group) => {
        allFiles.push({
          id: group.id,
          type: 'avatar',
          category: 'group-chats',
          filename: group.avatar,
          originalFilename: group.avatar,
          fileUrl: getFileUrl('group-avatars', group.avatar),
          relatedId: group.id,
          relatedName: group.name,
          createdAt: group.created_at,
        });
      });
    }

    // 6. Group message attachments
    if (!type || type === 'group-messages') {
      const attachments = await query<any[]>(
        `SELECT gma.*, gm.id as message_id, gm.content as message_content
         FROM group_message_attachments gma
         LEFT JOIN group_messages gm ON gma.message_id = gm.id
         ORDER BY gma.created_at DESC
         LIMIT ? OFFSET ?`,
        [limitNum, offsetNum]
      );
      
      attachments.forEach((att) => {
        allFiles.push({
          id: att.id,
          type: 'attachment',
          category: 'group-messages',
          filename: att.filename,
          originalFilename: att.original_filename,
          fileType: att.file_type,
          fileSize: att.file_size,
          fileUrl: att.file_url || getFileUrl('group-messages', att.filename),
          relatedId: att.message_id,
          createdAt: att.created_at,
        });
      });
    }

    // 7. Direct message attachments
    if (!type || type === 'direct-messages') {
      const attachments = await query<any[]>(
        `SELECT dma.*, dm.id as message_id, dm.content as message_content
         FROM direct_message_attachments dma
         LEFT JOIN direct_messages dm ON dma.message_id = dm.id
         ORDER BY dma.created_at DESC
         LIMIT ? OFFSET ?`,
        [limitNum, offsetNum]
      );
      
      attachments.forEach((att) => {
        allFiles.push({
          id: att.id,
          type: 'attachment',
          category: 'direct-messages',
          filename: att.filename,
          originalFilename: att.original_filename,
          fileType: att.file_type,
          fileSize: att.file_size,
          fileUrl: att.file_url || getFileUrl('direct-messages', att.filename),
          relatedId: att.message_id,
          createdAt: att.created_at,
        });
      });
    }

    // Sort by created_at descending
    allFiles.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    // Get total counts for each category
    const counts: any = {};
    
    if (!type || type === 'avatars') {
      const userCount = await query<any[]>(
        'SELECT COUNT(*) as total FROM users WHERE avatar IS NOT NULL AND avatar != ?',
        ['']
      );
      counts.avatars = userCount[0]?.total || 0;
    }

    if (!type || type === 'transactions') {
      const transCount = await query<any[]>(
        'SELECT COUNT(*) as total FROM transaction_attachments'
      );
      counts.transactions = transCount[0]?.total || 0;
    }

    if (!type || type === 'comments') {
      const commentCount = await query<any[]>(
        'SELECT COUNT(*) as total FROM comment_attachments'
      );
      counts['project-comments'] = commentCount[0]?.total || 0;
    }

    if (!type || type === 'purchase-request-comments') {
      const prCommentCount = await query<any[]>(
        'SELECT COUNT(*) as total FROM purchase_request_comment_attachments'
      );
      counts['purchase-request-comments'] = prCommentCount[0]?.total || 0;
    }

    if (!type || type === 'group-avatars') {
      const groupCount = await query<any[]>(
        'SELECT COUNT(*) as total FROM group_chats WHERE avatar IS NOT NULL AND avatar != ?',
        ['']
      );
      counts['group-avatars'] = groupCount[0]?.total || 0;
    }

    if (!type || type === 'group-messages') {
      const groupMsgCount = await query<any[]>(
        'SELECT COUNT(*) as total FROM group_message_attachments'
      );
      counts['group-messages'] = groupMsgCount[0]?.total || 0;
    }

    if (!type || type === 'direct-messages') {
      const directMsgCount = await query<any[]>(
        'SELECT COUNT(*) as total FROM direct_message_attachments'
      );
      counts['direct-messages'] = directMsgCount[0]?.total || 0;
    }

    res.json({
      files: allFiles,
      total: allFiles.length,
      counts,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error: any) {
    console.error('Error fetching all files:', error);
    res.status(500).json({ 
      error: 'Không thể lấy danh sách file',
      message: error.message 
    });
  }
};

// Get file statistics
export const getFileStats = async (req: Request, res: Response) => {
  try {
    const stats: any = {};

    // Count by category
    const [userAvatars] = await query<any[]>(
      'SELECT COUNT(*) as total FROM users WHERE avatar IS NOT NULL AND avatar != ?',
      ['']
    );
    stats.userAvatars = userAvatars?.total || 0;

    const [transactionAttachments] = await query<any[]>(
      'SELECT COUNT(*) as total FROM transaction_attachments'
    );
    stats.transactionAttachments = transactionAttachments?.total || 0;

    const [commentAttachments] = await query<any[]>(
      'SELECT COUNT(*) as total FROM comment_attachments'
    );
    stats.commentAttachments = commentAttachments?.total || 0;

    const [prCommentAttachments] = await query<any[]>(
      'SELECT COUNT(*) as total FROM purchase_request_comment_attachments'
    );
    stats.purchaseRequestCommentAttachments = prCommentAttachments?.total || 0;

    const [groupAvatars] = await query<any[]>(
      'SELECT COUNT(*) as total FROM group_chats WHERE avatar IS NOT NULL AND avatar != ?',
      ['']
    );
    stats.groupAvatars = groupAvatars?.total || 0;

    const [groupMessageAttachments] = await query<any[]>(
      'SELECT COUNT(*) as total FROM group_message_attachments'
    );
    stats.groupMessageAttachments = groupMessageAttachments?.total || 0;

    const [directMessageAttachments] = await query<any[]>(
      'SELECT COUNT(*) as total FROM direct_message_attachments'
    );
    stats.directMessageAttachments = directMessageAttachments?.total || 0;

    // Calculate total
    stats.total = Object.values(stats).reduce((sum: number, val: any) => {
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);

    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching file stats:', error);
    res.status(500).json({ 
      error: 'Không thể lấy thống kê file',
      message: error.message 
    });
  }
};

