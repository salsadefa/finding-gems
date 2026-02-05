"use strict";
// ============================================
// User Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth_1.authenticate, user_controller_1.getMe);
/**
 * @route   PATCH /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/me', auth_1.authenticate, user_controller_1.updateMe);
/**
 * @route   GET /api/v1/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), user_controller_1.getUsers);
/**
 * @route   POST /api/v1/users
 * @desc    Create new user (Admin only)
 * @access  Private (Admin)
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), user_controller_1.createUser);
/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', auth_1.authenticate, user_controller_1.getUserById);
/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Own profile or Admin)
 */
router.patch('/:id', auth_1.authenticate, user_controller_1.updateUser);
/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Own profile or Admin)
 */
router.delete('/:id', auth_1.authenticate, user_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map