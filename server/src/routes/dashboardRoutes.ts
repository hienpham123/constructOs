import { Router } from 'express';
import { getDashboardStats, getMonthlyStats } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/monthly', getMonthlyStats);

export default router;

