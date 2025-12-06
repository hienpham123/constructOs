import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  uploadAvatar,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadAvatar as uploadMiddleware } from '../middleware/upload.js';

const router = Router();

router.get('/me', authenticate, getCurrentUser);
router.post('/me/avatar', authenticate, uploadMiddleware.single('avatar'), uploadAvatar);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

