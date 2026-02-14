// ============================================
// Escrow Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  confirmDelivery,
  requestRefundForOrder,
  adminReleaseEscrow,
  adminRefundEscrow,
} from '../controllers/escrow.controller';

const router = Router();

// Buyer actions
router.post('/orders/:orderId/confirm-delivery', authenticate, confirmDelivery);
router.post('/orders/:orderId/request-refund', authenticate, requestRefundForOrder);

// Admin override actions
router.post('/admin/escrow/:orderId/release', authenticate, adminReleaseEscrow);
router.post('/admin/escrow/:orderId/refund', authenticate, adminRefundEscrow);

export default router;
