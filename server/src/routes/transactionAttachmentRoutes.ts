import { Router } from 'express';
import {
  getAttachments,
  createAttachments,
  deleteAttachment,
  uploadTransactionFiles,
} from '../controllers/transactionAttachmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get attachments for a transaction
router.get('/', getAttachments);

// Create attachments for a transaction (with file uploads)
router.post('/', authenticate, uploadTransactionFiles.array('files', 10), createAttachments);

// Delete an attachment
router.delete('/:id', authenticate, deleteAttachment);

export default router;

