import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import materialRoutes from './routes/materialRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import personnelRoutes from './routes/personnelRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import dailyReportRoutes from './routes/dailyReportRoutes.js';
import projectCommentRoutes from './routes/projectCommentRoutes.js';
import purchaseRequestCommentRoutes from './routes/purchaseRequestCommentRoutes.js';
import transactionAttachmentRoutes from './routes/transactionAttachmentRoutes.js';
import groupChatRoutes from './routes/groupChatRoutes.js';
import directMessageRoutes from './routes/directMessageRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
// Import database connection (test connection on startup)
import './config/db.js';
import { initializeSocket } from './utils/socket.js';

dotenv.config();

// Suppress pg client handleEmptyQuery errors globally
process.on('uncaughtException', (error: Error) => {
  if (error.message && (
    error.message.includes('handleEmptyQuery') ||
    (error.message.includes('Cannot read properties of undefined') && 
     error.message.includes('handleEmptyQuery'))
  )) {
    // Silently ignore - this is a pg client internal issue
    return;
  }
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason: any) => {
  if (reason && reason.message && (
    reason.message.includes('handleEmptyQuery') ||
    (reason.message.includes('Cannot read properties of undefined') && 
     reason.message.includes('handleEmptyQuery'))
  )) {
    // Silently ignore - this is a pg client internal issue
    return;
  }
  console.error('Unhandled Rejection:', reason);
});

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 2222;

// Middleware
// CORS - configure for production if frontend is on different domain
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (avatars, project reports, transaction attachments)
// Server runs from server/ directory, so uploads is directly in process.cwd()
const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('Serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/daily-reports', dailyReportRoutes);
app.use('/api/project-comments', projectCommentRoutes);
app.use('/api/purchase-request-comments', purchaseRequestCommentRoutes);
app.use('/api/transaction-attachments', transactionAttachmentRoutes);
app.use('/api/group-chats', groupChatRoutes);
app.use('/api/direct-messages', directMessageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize Socket.io
const io = initializeSocket(server);
(global as any).io = io;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Socket.io initialized for real-time chat`);
});

