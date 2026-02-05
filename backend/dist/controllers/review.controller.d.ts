import { Request, Response } from 'express';
/**
 * @desc    Get reviews with filters and pagination
 * @route   GET /api/v1/reviews
 * @access  Public
 */
export declare const getReviews: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get review by ID
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
export declare const getReviewById: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Create review
 * @route   POST /api/v1/reviews
 * @access  Private
 */
export declare const createReview: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Update review
 * @route   PATCH /api/v1/reviews/:id
 * @access  Private (Review owner)
 */
export declare const updateReview: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private (Review owner or Admin)
 */
export declare const deleteReview: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get my reviews
 * @route   GET /api/v1/reviews/my-reviews
 * @access  Private
 */
export declare const getMyReviews: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=review.controller.d.ts.map