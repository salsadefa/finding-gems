"use strict";
// ============================================
// Refund Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const refund_controller_1 = require("../controllers/refund.controller");
const router = (0, express_1.Router)();
// ============================================
// USER ROUTES (Authenticated)
// ============================================
router.post('/', auth_1.authenticate, refund_controller_1.requestRefund);
router.get('/', auth_1.authenticate, refund_controller_1.getRefunds);
router.get('/:id', auth_1.authenticate, refund_controller_1.getRefundDetail);
router.post('/:id/cancel', auth_1.authenticate, refund_controller_1.cancelRefund);
// ============================================
// ADMIN ROUTES
// ============================================
router.get('/admin/all', auth_1.authenticate, refund_controller_1.getAllRefunds);
router.post('/admin/:id/process', auth_1.authenticate, refund_controller_1.processRefund);
exports.default = router;
//# sourceMappingURL=refund.routes.js.map