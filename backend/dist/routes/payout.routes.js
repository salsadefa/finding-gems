"use strict";
// ============================================
// Payout Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const payout_controller_1 = require("../controllers/payout.controller");
const router = (0, express_1.Router)();
// ============================================
// CREATOR ROUTES (Authenticated)
// ============================================
// Balance
router.get('/balance', auth_1.authenticate, payout_controller_1.getCreatorBalance);
router.post('/balance/recalculate', auth_1.authenticate, payout_controller_1.recalculateBalance);
// Bank Accounts
router.get('/bank-accounts', auth_1.authenticate, payout_controller_1.getBankAccounts);
router.post('/bank-accounts', auth_1.authenticate, payout_controller_1.addBankAccount);
router.delete('/bank-accounts/:id', auth_1.authenticate, payout_controller_1.deleteBankAccount);
// Payout Requests
router.get('/', auth_1.authenticate, payout_controller_1.getPayouts);
router.post('/', auth_1.authenticate, payout_controller_1.requestPayout);
router.post('/:id/cancel', auth_1.authenticate, payout_controller_1.cancelPayout);
// ============================================
// ADMIN ROUTES
// ============================================
router.get('/admin/all', auth_1.authenticate, payout_controller_1.getAllPayouts);
router.post('/admin/:id/process', auth_1.authenticate, payout_controller_1.processPayout);
exports.default = router;
//# sourceMappingURL=payout.routes.js.map