// ============================================
// Bookmark Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import {
  getMyBookmarks,
  createBookmark,
  deleteBookmark,
  checkBookmark,
} from '../controllers/bookmark.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/bookmarks
 * @desc    Get current user's bookmarks
 * @access  Private
 */
router.get('/', authenticate, getMyBookmarks);

/**
 * @route   POST /api/v1/bookmarks
 * @desc    Create bookmark
 * @access  Private
 */
router.post('/', authenticate, createBookmark);

/**
 * @route   GET /api/v1/bookmarks/check/:websiteId
 * @desc    Check if website is bookmarked
 * @access  Private
 */
router.get('/check/:websiteId', authenticate, checkBookmark);

/**
 * @route   DELETE /api/v1/bookmarks/:websiteId
 * @desc    Delete bookmark
 * @access  Private
 */
router.delete('/:websiteId', authenticate, deleteBookmark);

export default router;
