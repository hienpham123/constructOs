import { Router } from 'express';
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getTransactions,
  createTransaction,
  getPurchaseRequests,
  createPurchaseRequest,
  updatePurchaseRequest,
} from '../controllers/materialController.js';

const router = Router();

router.get('/', getMaterials);
router.get('/:id', getMaterialById);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

router.get('/transactions/list', getTransactions);
router.post('/transactions', createTransaction);

router.get('/purchase-requests/list', getPurchaseRequests);
router.post('/purchase-requests', createPurchaseRequest);
router.put('/purchase-requests/:id', updatePurchaseRequest);

export default router;

