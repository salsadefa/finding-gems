"use strict";
// ============================================
// Authentication Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', auth_controller_1.register);
/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', auth_controller_1.login);
/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth_1.authenticate, auth_controller_1.logout);
/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', auth_controller_1.refresh);
/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth_1.authenticate, auth_controller_1.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map