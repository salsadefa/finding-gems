"use strict";
// ============================================
// Review Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/reviews
 * @desc    Get all reviews with filters
 * @access  Public
 */
router.get('/', auth_1.optionalAuth, review_controller_1.getReviews);
/**
 * @route   GET /api/v1/reviews/my-reviews
 * @desc    Get current user's reviews
 * @access  Private
 */
router.get('/my-reviews', auth_1.authenticate, review_controller_1.getMyReviews);
/**
 * @route   POST /api/v1/reviews
 * @desc    Create review
 * @access  Private
 */
router.post('/', auth_1.authenticate, review_controller_1.createReview);
/**
 * @route   GET /api/v1/reviews/:id
 * @desc    Get review by ID
 * @access  Public
 */
router.get('/:id', auth_1.optionalAuth, review_controller_1.getReviewById);
/**
 * @route   PATCH /api/v1/reviews/:id
 * @desc    Update review
 * @access  Private (Owner)
 */
router.patch('/:id', auth_1.authenticate, review_controller_1.updateReview);
/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete review
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', auth_1.authenticate, review_controller_1.deleteReview);
exports.default = router;
//# sourceMappingURL=review.routes.js.map