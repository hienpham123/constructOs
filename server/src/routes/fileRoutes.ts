import { Router } from 'express';
import {
  getAllFiles,
  getFileStats,
} from '../controllers/fileController.js';

const router = Router();

// Get all uploaded files (with optional type filter)
// Query params: ?type=avatars|transactions|comments|...&limit=100&offset=0
router.get('/all', getAllFiles);

// Get file statistics
router.get('/stats', getFileStats);

export default router;

