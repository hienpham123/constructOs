import { Router } from 'express';
import {
  getProjectReports,
  getProjectReportById,
  createProjectReport,
  updateProjectReport,
  deleteProjectReport,
  deleteAttachment,
  upload,
} from '../controllers/projectReportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getProjectReports);
router.get('/:id', getProjectReportById);
router.post('/', upload.array('attachments', 10), createProjectReport);
router.put('/:id', upload.array('attachments', 10), updateProjectReport);
router.delete('/:id', deleteProjectReport);
router.delete('/attachments/:id', deleteAttachment);

export default router;

