"use strict";
// ============================================
// Payment Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
// ============================================
// PAYMENT ROUTES
// ============================================
// Initiate payment for an order
router.post('/initiate', auth_1.authenticate, payment_controller_1.initiatePayment);
// Get payment status
router.get('/:transactionId/status', payment_controller_1.getPaymentStatus);
// Payment webhooks (from payment gateway - no auth)
router.post('/webhook', payment_controller_1.handlePaymentWebhook);
router.post('/webhook/xendit', payment_controller_1.handleXenditWebhook);
// Manual payment confirmation (admin only)
router.post('/:transactionId/confirm', auth_1.authenticate, payment_controller_1.confirmPayment);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map