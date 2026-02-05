// ============================================
// Refund Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  requestRefund,
  getRefunds,
  getRefundDetail,
  cancelRefund,
  getAllRefunds,
  processRefund
} from '../controllers/refund.controller';

const router = Router();

// ============================================
// USER ROUTES (Authenticated)
// ============================================

router.post('/', authenticate, requestRefund);
router.get('/', authenticate, getRefunds);
router.get('/:id', authenticate, getRefundDetail);
router.post('/:id/cancel', authenticate, cancelRefund);

// ============================================
// ADMIN ROUTES
// ============================================

router.get('/admin/all', authenticate, getAllRefunds);
router.post('/admin/:id/process', authenticate, processRefund);

export default router;
