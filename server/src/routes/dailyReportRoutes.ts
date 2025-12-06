import { Router } from 'express';
import {
  getDailyReports,
  getDailyReportByUserAndDate,
  createOrUpdateDailyReport,
  deleteDailyReport,
} from '../controllers/dailyReportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getDailyReports);
router.get('/:userId/:date', getDailyReportByUserAndDate);
router.post('/:userId/:date', createOrUpdateDailyReport);
router.put('/:userId/:date', createOrUpdateDailyReport);
router.delete('/:id', deleteDailyReport);

export default router;

