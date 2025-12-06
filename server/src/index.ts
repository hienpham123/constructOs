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

// Serve static files (avatars)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/roles', roleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

