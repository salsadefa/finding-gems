// ============================================
// Billing Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  // Pricing
  getWebsitePricing,
  createPricingTier,
  updatePricingTier,
  deletePricingTier,
  // Orders
  createOrder,
  getOrder,
  getMyOrders,
  cancelOrder,
  // Invoices
  getOrderInvoice,
  getMyInvoices,
  // Access
  getMyAccess,
  checkAccess,
  // Creator
  getCreatorSales
} from '../controllers/billing.controller';

const router = Router();

// ============================================
// PRICING TIER ROUTES
// ============================================

// Get pricing for a website (public)
router.get('/websites/:websiteId/pricing', getWebsitePricing);

// Create pricing tier (creator/admin only)
router.post('/websites/:websiteId/pricing', authenticate, createPricingTier);

// Update pricing tier (creator/admin only)
router.patch('/pricing/:tierId', authenticate, updatePricingTier);

// Delete pricing tier (creator/admin only)
router.delete('/pricing/:tierId', authenticate, deletePricingTier);

// ============================================
// ORDER ROUTES
// ============================================

// Create order (authenticated users)
router.post('/orders', authenticate, createOrder);

// Get my orders (purchase history)
router.get('/orders/my', authenticate, getMyOrders);

// Get specific order
router.get('/orders/:orderId', authenticate, getOrder);

// Cancel order
router.post('/orders/:orderId/cancel', authenticate, cancelOrder);

// Get order invoice
router.get('/orders/:orderId/invoice', authenticate, getOrderInvoice);

// ============================================
// INVOICE ROUTES
// ============================================

// Get my invoices
router.get('/invoices/my', authenticate, getMyInvoices);

// ============================================
// ACCESS ROUTES
// ============================================

// Get my access (purchased products)
router.get('/access/my', authenticate, getMyAccess);

// Check access to specific website
router.get('/access/check/:websiteId', authenticate, checkAccess);

// ============================================
// CREATOR ROUTES
// ============================================

// Get creator sales
router.get('/creator/sales', authenticate, getCreatorSales);

export default router;
