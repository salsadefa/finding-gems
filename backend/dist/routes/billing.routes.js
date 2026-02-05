"use strict";
// ============================================
// Billing Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const billing_controller_1 = require("../controllers/billing.controller");
const router = (0, express_1.Router)();
// ============================================
// PRICING TIER ROUTES
// ============================================
// Get pricing for a website (public)
router.get('/websites/:websiteId/pricing', billing_controller_1.getWebsitePricing);
// Create pricing tier (creator/admin only)
router.post('/websites/:websiteId/pricing', auth_1.authenticate, billing_controller_1.createPricingTier);
// Update pricing tier (creator/admin only)
router.patch('/pricing/:tierId', auth_1.authenticate, billing_controller_1.updatePricingTier);
// Delete pricing tier (creator/admin only)
router.delete('/pricing/:tierId', auth_1.authenticate, billing_controller_1.deletePricingTier);
// ============================================
// ORDER ROUTES
// ============================================
// Create order (authenticated users)
router.post('/orders', auth_1.authenticate, billing_controller_1.createOrder);
// Get my orders (purchase history)
router.get('/orders/my', auth_1.authenticate, billing_controller_1.getMyOrders);
// Get specific order
router.get('/orders/:orderId', auth_1.authenticate, billing_controller_1.getOrder);
// Cancel order
router.post('/orders/:orderId/cancel', auth_1.authenticate, billing_controller_1.cancelOrder);
// Get order invoice
router.get('/orders/:orderId/invoice', auth_1.authenticate, billing_controller_1.getOrderInvoice);
// ============================================
// INVOICE ROUTES
// ============================================
// Get my invoices
router.get('/invoices/my', auth_1.authenticate, billing_controller_1.getMyInvoices);
// ============================================
// ACCESS ROUTES
// ============================================
// Get my access (purchased products)
router.get('/access/my', auth_1.authenticate, billing_controller_1.getMyAccess);
// Check access to specific website
router.get('/access/check/:websiteId', auth_1.authenticate, billing_controller_1.checkAccess);
// ============================================
// CREATOR ROUTES
// ============================================
// Get creator sales
router.get('/creator/sales', auth_1.authenticate, billing_controller_1.getCreatorSales);
exports.default = router;
//# sourceMappingURL=billing.routes.js.map