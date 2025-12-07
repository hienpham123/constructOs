import express from 'express';
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembers,
  removeMember,
  transferOwnership,
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  togglePinGroup,
  uploadGroupAvatar,
  uploadMessageFiles,
} from '../controllers/groupChatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Group routes
router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/', uploadGroupAvatar.single('avatar'), createGroup);
router.put('/:id', uploadGroupAvatar.single('avatar'), updateGroup);
router.delete('/:id', deleteGroup);

// Member management routes
router.post('/:id/members', addMembers);
router.delete('/:id/members/:memberId', removeMember);
router.post('/:id/transfer-ownership', transferOwnership);

// Message routes
router.get('/:id/messages', getMessages);
router.post('/:id/messages', uploadMessageFiles.array('files', 10), sendMessage);
router.put('/messages/:messageId', updateMessage);
router.delete('/messages/:messageId', deleteMessage);

// Pin/Unpin group
router.post('/:id/pin', togglePinGroup);

export default router;

