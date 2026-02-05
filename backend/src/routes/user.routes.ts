// ============================================
// User Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   PATCH /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/me', authenticate, updateMe);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticate, authorize('admin'), getUsers);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user (Admin only)
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize('admin'), createUser);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', authenticate, getUserById);

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Own profile or Admin)
 */
router.patch('/:id', authenticate, updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Own profile or Admin)
 */
router.delete('/:id', authenticate, deleteUser);

export default router;
