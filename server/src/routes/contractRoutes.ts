import { Router } from 'express';
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
} from '../controllers/contractController.js';

const router = Router();

router.get('/', getContracts);
router.get('/:id', getContractById);
router.post('/', createContract);
router.put('/:id', updateContract);
router.delete('/:id', deleteContract);

export default router;

