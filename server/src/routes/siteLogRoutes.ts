import { Router } from 'express';
import {
  getSiteLogs,
  getSiteLogById,
  createSiteLog,
  updateSiteLog,
  deleteSiteLog,
} from '../controllers/siteLogController.js';

const router = Router();

router.get('/', getSiteLogs);
router.get('/:id', getSiteLogById);
router.post('/', createSiteLog);
router.put('/:id', updateSiteLog);
router.delete('/:id', deleteSiteLog);

export default router;

