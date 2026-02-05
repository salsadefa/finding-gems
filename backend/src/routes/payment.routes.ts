// ============================================
// Payment Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  initiatePayment,
  getPaymentStatus,
  handlePaymentWebhook,
  handleXenditWebhook,
  confirmPayment
} from '../controllers/payment.controller';

const router = Router();

// ============================================
// PAYMENT ROUTES
// ============================================

// Initiate payment for an order
router.post('/initiate', authenticate, initiatePayment);

// Get payment status
router.get('/:transactionId/status', getPaymentStatus);

// Payment webhooks (from payment gateway - no auth)
router.post('/webhook', handlePaymentWebhook);
router.post('/webhook/xendit', handleXenditWebhook);

// Manual payment confirmation (admin only)
router.post('/:transactionId/confirm', authenticate, confirmPayment);

export default router;

