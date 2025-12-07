import { Router } from 'express';
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getPurchaseRequests,
  getPurchaseRequestById,
  createPurchaseRequest,
  updatePurchaseRequest,
  deletePurchaseRequest,
} from '../controllers/materialController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getMaterials);
router.get('/:id', getMaterialById);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

router.get('/transactions/list', getTransactions);
router.get('/transactions/:id', getTransactionById);
router.post('/transactions', authenticate, createTransaction);
router.put('/transactions/:id', authenticate, updateTransaction);
router.delete('/transactions/:id', authenticate, deleteTransaction);

router.get('/purchase-requests/list', getPurchaseRequests);
router.get('/purchase-requests/:id', getPurchaseRequestById);
router.post('/purchase-requests', authenticate, createPurchaseRequest);
router.put('/purchase-requests/:id', authenticate, updatePurchaseRequest);
router.delete('/purchase-requests/:id', authenticate, deletePurchaseRequest);

export default router;

