import { Router } from 'express';
import {
  getSiteLogs,
  getSiteLogById,
  createSiteLog,
  updateSiteLog,
  deleteSiteLog,
} from '../controllers/siteLogController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getSiteLogs);
router.get('/:id', getSiteLogById);
router.post('/', authenticate, createSiteLog);
router.put('/:id', authenticate, updateSiteLog);
router.delete('/:id', authenticate, deleteSiteLog);

export default router;

