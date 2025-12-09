import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { 
  isSupabaseStorageEnabled, 
  uploadBufferToSupabaseStorage,
  getSupabaseStorageUrl 
} from '../utils/supabaseStorage.js';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage - use memory storage if Supabase is enabled, otherwise disk storage
const storage = isSupabaseStorageEnabled() 
  ? multer.memoryStorage() // Use memory storage for Supabase
  : multer.diskStorage({
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
    fileSize: 2 * 1024 * 1024, // 2MB max (reduced from 5MB for better storage efficiency)
  },
  fileFilter,
});

// Get avatar URL
export const getAvatarUrl = (filename: string | null | undefined): string | null => {
  if (!filename) return null;
  
  // If already a full URL (from Supabase), return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If Supabase Storage is enabled, get URL from Supabase
  if (isSupabaseStorageEnabled()) {
    return getSupabaseStorageUrl('avatars', filename);
  }
  
  // Fallback to local filesystem URL
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/avatars/${filename}`;
};

// Helper function to handle file upload (works with both Supabase and filesystem)
export async function handleFileUpload(
  file: Express.Multer.File,
  bucketName: string
): Promise<{ filename: string; url: string }> {
  const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
  
  // If Supabase Storage is enabled, upload to Supabase
  if (isSupabaseStorageEnabled() && file.buffer) {
    const url = await uploadBufferToSupabaseStorage(
      bucketName,
      file.buffer,
      uniqueName,
      file.mimetype
    );
    
    if (url) {
      return { filename: uniqueName, url };
    }
    // Fallback to filesystem if Supabase upload fails
  }
  
  // Fallback to filesystem storage
  const uploadDir = path.join(process.cwd(), 'uploads', bucketName);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filePath = path.join(uploadDir, uniqueName);
  // Use buffer if available (memory storage), otherwise read from disk
  if (file.buffer) {
    fs.writeFileSync(filePath, file.buffer);
  } else if (file.path) {
    fs.writeFileSync(filePath, fs.readFileSync(file.path));
  } else {
    throw new Error('File buffer or path is required');
  }
  
  // Get URL based on storage type
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return {
    filename: uniqueName,
    url: `${baseUrl}/uploads/${bucketName}/${uniqueName}`
  };
}

// ============================================
// Transaction Attachments Upload
// ============================================

// Create uploads directory for transaction attachments
const transactionAttachmentsDir = path.join(process.cwd(), 'uploads', 'transactions');
if (!fs.existsSync(transactionAttachmentsDir)) {
  fs.mkdirSync(transactionAttachmentsDir, { recursive: true });
}

// Configure storage for transaction attachments - use memory storage if Supabase is enabled
const transactionStorage = isSupabaseStorageEnabled()
  ? multer.memoryStorage() // Use memory storage for Supabase
  : multer.diskStorage({
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
    fileSize: 5 * 1024 * 1024, // 5MB max per file (reduced from 10MB for better storage efficiency)
  },
  fileFilter: transactionFileFilter,
});

// Get transaction attachment URL
export const getTransactionAttachmentUrl = (filename: string | null | undefined): string | null => {
  if (!filename) return null;
  
  // If already a full URL (from Supabase), return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If Supabase Storage is enabled, get URL from Supabase
  if (isSupabaseStorageEnabled()) {
    return getSupabaseStorageUrl('transactions', filename);
  }
  
  // Fallback to local filesystem URL
  const baseUrl = process.env.API_BASE_URL || 
                  process.env.SERVER_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_API_URL || 'https://your-api-domain.com'
                    : 'http://localhost:2222');
  
  return `${baseUrl}/uploads/transactions/${filename}`;
};

