import { Router } from 'express';
import { createTask, getTasksByProject, updateTask, updateTaskStatus, deleteTask } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Lấy danh sách công việc theo dự án
router.get('/projects/:projectId/tasks', authenticate, getTasksByProject);

// Tạo công việc mới
router.post('/projects/:projectId/tasks', authenticate, createTask);

// Cập nhật thông tin công việc
router.put('/tasks/:taskId', authenticate, updateTask);

// Cập nhật trạng thái công việc
router.post('/tasks/:taskId/status', authenticate, updateTaskStatus);

// Xóa công việc (xóa cả task con)
router.delete('/tasks/:taskId', authenticate, deleteTask);

export default router;


