import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  deleteAttachment,
  uploadCommentFiles,
} from '../controllers/purchaseRequestCommentController.js';

const router = express.Router();

// Get comments for a purchase request
router.get('/', getComments);

// Create a new comment
router.post('/', authenticate, uploadCommentFiles.array('files', 10), createComment);

// Update a comment
router.put('/:id', authenticate, updateComment);

// Delete a comment
router.delete('/:id', authenticate, deleteComment);

// Delete an attachment
router.delete('/attachments/:id', authenticate, deleteAttachment);

export default router;

