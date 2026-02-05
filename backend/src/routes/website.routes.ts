// ============================================
// Website Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import {
  getWebsites,
  getWebsiteById,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  getMyWebsites,
} from '../controllers/website.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/websites
 * @desc    Get all websites with filters and pagination
 * @access  Public
 */
router.get('/', optionalAuth, getWebsites);

/**
 * @route   GET /api/v1/websites/my-websites
 * @desc    Get current user's websites
 * @access  Private (Creator)
 */
router.get('/my-websites', authenticate, authorize('creator', 'admin'), getMyWebsites);

/**
 * @route   POST /api/v1/websites
 * @desc    Create new website
 * @access  Private (Creator)
 */
router.post('/', authenticate, authorize('creator', 'admin'), createWebsite);

/**
 * @route   GET /api/v1/websites/:id
 * @desc    Get website by ID or slug
 * @access  Public
 */
router.get('/:id', optionalAuth, getWebsiteById);

/**
 * @route   PATCH /api/v1/websites/:id
 * @desc    Update website
 * @access  Private (Creator/Admin)
 */
router.patch('/:id', authenticate, updateWebsite);

/**
 * @route   DELETE /api/v1/websites/:id
 * @desc    Delete website
 * @access  Private (Creator/Admin)
 */
router.delete('/:id', authenticate, deleteWebsite);

export default router;
