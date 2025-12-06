import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter - only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Configure multer
export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter,
});

// Get avatar URL
export const getAvatarUrl = (filename: string | null | undefined): string | null => {
  if (!filename) return null;
  
  // In production, use environment variable for API base URL
  // This allows different URLs for development and production
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/avatars/${filename}`;
};

// ============================================
// Transaction Attachments Upload
// ============================================

// Create uploads directory for transaction attachments
const transactionAttachmentsDir = path.join(process.cwd(), 'uploads', 'transactions');
if (!fs.existsSync(transactionAttachmentsDir)) {
  fs.mkdirSync(transactionAttachmentsDir, { recursive: true });
}

// Configure storage for transaction attachments
const transactionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, transactionAttachmentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for transaction attachments - allow images, PDF, Excel, Word, CSV
const transactionFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype === 'application/pdf' ||
                   file.mimetype === 'application/msword' ||
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.mimetype === 'application/vnd.ms-excel' ||
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   file.mimetype === 'text/csv';

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh, PDF, Excel, Word, CSV'));
  }
};

// Configure multer for transaction attachments
export const uploadTransactionAttachments = multer({
  storage: transactionStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
  },
  fileFilter: transactionFileFilter,
});

// Get transaction attachment URL
export const getTransactionAttachmentUrl = (filename: string | null | undefined): string | null => {
  if (!filename) return null;
  
  // If already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // In production, use environment variable for API base URL
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/transactions/${filename}`;
};

