// ============================================
// Review Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
} from '../controllers/review.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/reviews
 * @desc    Get all reviews with filters
 * @access  Public
 */
router.get('/', optionalAuth, getReviews);

/**
 * @route   GET /api/v1/reviews/my-reviews
 * @desc    Get current user's reviews
 * @access  Private
 */
router.get('/my-reviews', authenticate, getMyReviews);

/**
 * @route   POST /api/v1/reviews
 * @desc    Create review
 * @access  Private
 */
router.post('/', authenticate, createReview);

/**
 * @route   GET /api/v1/reviews/:id
 * @desc    Get review by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, getReviewById);

/**
 * @route   PATCH /api/v1/reviews/:id
 * @desc    Update review
 * @access  Private (Owner)
 */
router.patch('/:id', authenticate, updateReview);

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete review
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', authenticate, deleteReview);

export default router;
