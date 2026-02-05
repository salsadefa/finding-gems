// ============================================
// Payout Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCreatorBalance,
  recalculateBalance,
  getBankAccounts,
  addBankAccount,
  deleteBankAccount,
  getPayouts,
  requestPayout,
  cancelPayout,
  getAllPayouts,
  processPayout
} from '../controllers/payout.controller';

const router = Router();

// ============================================
// CREATOR ROUTES (Authenticated)
// ============================================

// Balance
router.get('/balance', authenticate, getCreatorBalance);
router.post('/balance/recalculate', authenticate, recalculateBalance);

// Bank Accounts
router.get('/bank-accounts', authenticate, getBankAccounts);
router.post('/bank-accounts', authenticate, addBankAccount);
router.delete('/bank-accounts/:id', authenticate, deleteBankAccount);

// Payout Requests
router.get('/', authenticate, getPayouts);
router.post('/', authenticate, requestPayout);
router.post('/:id/cancel', authenticate, cancelPayout);

// ============================================
// ADMIN ROUTES
// ============================================

router.get('/admin/all', authenticate, getAllPayouts);
router.post('/admin/:id/process', authenticate, processPayout);

export default router;
