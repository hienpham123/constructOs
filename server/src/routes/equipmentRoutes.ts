import { Router } from 'express';
import {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getUsage,
  getUsageById,
  createUsage,
  updateUsage,
  deleteUsage,
  getMaintenanceSchedules,
  getMaintenanceScheduleById,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  deleteMaintenanceSchedule,
} from '../controllers/equipmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getEquipment);
router.get('/:id', getEquipmentById);
router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

router.get('/usage/list', getUsage);
router.get('/usage/:id', getUsageById);
router.post('/usage', authenticate, createUsage);
router.put('/usage/:id', authenticate, updateUsage);
router.delete('/usage/:id', authenticate, deleteUsage);

router.get('/maintenance/list', getMaintenanceSchedules);
router.get('/maintenance/:id', getMaintenanceScheduleById);
router.post('/maintenance', authenticate, createMaintenanceSchedule);
router.put('/maintenance/:id', authenticate, updateMaintenanceSchedule);
router.delete('/maintenance/:id', authenticate, deleteMaintenanceSchedule);

export default router;

