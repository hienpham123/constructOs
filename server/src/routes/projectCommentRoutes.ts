import { Router } from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  uploadCommentFiles,
} from '../controllers/projectCommentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get comments for a project and category
router.get('/', getComments);

// Create a new comment (with optional file uploads)
router.post('/', authenticate, uploadCommentFiles.array('files', 10), createComment);

// Update a comment
router.put('/:id', authenticate, updateComment);

// Delete a comment
router.delete('/:id', authenticate, deleteComment);

export default router;

