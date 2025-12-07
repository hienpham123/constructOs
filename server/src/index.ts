import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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
// Import database connection (test connection on startup)
import './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2222;

// Middleware
// CORS - configure for production if frontend is on different domain
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

