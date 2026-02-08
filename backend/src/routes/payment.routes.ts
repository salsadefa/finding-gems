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
  confirmPayment,
  createQRISPayment,
  createVAPayment,
  getAvailableVABanks,
  createEWalletPayment,
  getAvailableEWallets
} from '../controllers/payment.controller';

const router = Router();

// ============================================
// PAYMENT ROUTES
// ============================================

// Initiate payment for an order (redirects to Xendit checkout)
router.post('/initiate', authenticate, initiatePayment);

// ============================================
// DIRECT PAYMENT - Custom UI (no redirect)
// ============================================

// QRIS payment (returns QR string for custom display)
router.post('/qris', authenticate, createQRISPayment);

// Virtual Account payment (returns VA number for custom display)
router.post('/virtual-account', authenticate, createVAPayment);

// Get available VA banks
router.get('/virtual-account/banks', getAvailableVABanks);

// E-Wallet payment (returns redirect URLs for custom display)
router.post('/ewallet', authenticate, createEWalletPayment);

// Get available E-Wallets
router.get('/ewallet/options', getAvailableEWallets);

// ============================================
// STATUS & WEBHOOKS
// ============================================

// Get payment status
router.get('/:transactionId/status', getPaymentStatus);

// Payment webhooks (from payment gateway - no auth)
router.post('/webhook', handlePaymentWebhook);
router.post('/webhook/xendit', handleXenditWebhook);

// Manual payment confirmation (admin only)
router.post('/:transactionId/confirm', authenticate, confirmPayment);

export default router;
