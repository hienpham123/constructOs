import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime } from '../utils/dataHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Helper function to get transaction attachment URL
function getTransactionAttachmentUrl(filename: string): string {
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/transactions/${filename}`;
}

// Configure multer for transaction attachments
const transactionAttachmentsDir = path.join(process.cwd(), 'uploads', 'transactions');
if (!fs.existsSync(transactionAttachmentsDir)) {
  fs.mkdirSync(transactionAttachmentsDir, { recursive: true });
}

const transactionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, transactionAttachmentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const uploadTransactionFiles = multer({
  storage: transactionStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file (reduced from 10MB for better storage efficiency)
  },
});

// Get attachments for a transaction
export const getAttachments = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId là bắt buộc' });
    }

    // Verify transaction exists
    const transaction = await query<any[]>(
      'SELECT id FROM material_transactions WHERE id = ?',
      [transactionId]
    );

    if (transaction.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    }

    // Get attachments
    const attachments = await query<any[]>(
      'SELECT * FROM transaction_attachments WHERE transaction_id = ? ORDER BY created_at ASC',
      [transactionId]
    );

    // Convert attachments to full URLs
    const attachmentsWithUrls = attachments.map((att) => ({
      id: att.id,
      transactionId: att.transaction_id,
      filename: att.filename,
      originalFilename: att.original_filename,
      fileType: att.file_type,
      fileSize: att.file_size,
      fileUrl: getTransactionAttachmentUrl(att.filename),
      createdAt: att.created_at,
    }));

    res.json(attachmentsWithUrls);
  } catch (error: any) {
    console.error('Error fetching transaction attachments:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách file đính kèm' });
  }
};

// Create attachments for a transaction
export const createAttachments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }

    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId là bắt buộc' });
    }

    // Verify transaction exists
    const transaction = await query<any[]>(
      'SELECT id FROM material_transactions WHERE id = ?',
      [transactionId]
    );

    if (transaction.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    }

    // Handle file attachments if any
    const attachments = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const files = req.files as Express.Multer.File[];
      const createdAt = toMySQLDateTime();
      
      for (const file of files) {
        const attachmentId = uuidv4();
        const fileUrl = getTransactionAttachmentUrl(file.filename);

        await query(
          `INSERT INTO transaction_attachments (id, transaction_id, filename, original_filename, file_type, file_size, file_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attachmentId,
            transactionId,
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
          transactionId,
          filename: file.filename,
          originalFilename: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          fileUrl,
          createdAt,
        });
      }
    }

    res.status(201).json(attachments);
  } catch (error: any) {
    console.error('Error creating transaction attachments:', error);
    res.status(500).json({ error: 'Không thể tạo file đính kèm' });
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

    // Get attachment to check if it exists
    const attachment = await query<any[]>(
      'SELECT * FROM transaction_attachments WHERE id = ?',
      [id]
    );

    if (attachment.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy file đính kèm' });
    }

    // Verify transaction exists (optional check)
    const transaction = await query<any[]>(
      'SELECT id FROM material_transactions WHERE id = ?',
      [attachment[0].transaction_id]
    );

    if (transaction.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    }

    // Delete file from disk
    try {
      const filePath = path.join(transactionAttachmentsDir, attachment[0].filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError: any) {
      console.error(`Error deleting file ${attachment[0].filename}:`, fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete attachment from database
    await query('DELETE FROM transaction_attachments WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting transaction attachment:', error);
    res.status(500).json({ error: 'Không thể xóa file đính kèm' });
  }
};

