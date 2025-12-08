import express from 'express';
import {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  deleteConversation,
  uploadMessageFiles,
} from '../controllers/directMessageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Conversation routes
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getConversation);
router.delete('/conversations/:conversationId', deleteConversation);

// Message routes - using receiverId for convenience
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/users/:receiverId/messages', uploadMessageFiles.array('files', 10), sendMessage);
router.put('/messages/:messageId', updateMessage);
router.delete('/messages/:messageId', deleteMessage);

export default router;

