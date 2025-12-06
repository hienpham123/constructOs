import { Router } from 'express';
import {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getUsage,
  createUsage,
  getMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
} from '../controllers/equipmentController.js';

const router = Router();

router.get('/', getEquipment);
router.get('/:id', getEquipmentById);
router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

router.get('/usage/list', getUsage);
router.post('/usage', createUsage);

router.get('/maintenance/list', getMaintenanceSchedules);
router.post('/maintenance', createMaintenanceSchedule);
router.put('/maintenance/:id', updateMaintenanceSchedule);

export default router;

