// ============================================
// Category Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 * @cache   5 minutes (rarely changes)
 */
router.get('/', cacheMiddleware(300000), getCategories);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID or slug
 * @access  Public
 * @cache   5 minutes
 */
router.get('/:id', cacheMiddleware(300000), getCategoryById);

/**
 * @route   POST /api/v1/categories
 * @desc    Create new category
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize('admin'), createCategory);

/**
 * @route   PATCH /api/v1/categories/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
router.patch('/:id', authenticate, authorize('admin'), updateCategory);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default router;
