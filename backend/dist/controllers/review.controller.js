"use strict";
// ============================================
// Review Controller - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyReviews = exports.deleteReview = exports.updateReview = exports.createReview = exports.getReviewById = exports.getReviews = void 0;
const database_1 = require("../config/database");
const catchAsync_1 = require("../utils/catchAsync");
const errors_1 = require("../utils/errors");
/**
 * @desc    Get reviews with filters and pagination
 * @route   GET /api/v1/reviews
 * @access  Public
 */
exports.getReviews = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { page = 1, limit = 10, websiteId, userId, minRating, sortBy = 'newest', } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    // Build where clause
    const where = {};
    if (websiteId) {
        where.websiteId = websiteId;
    }
    if (userId) {
        where.userId = userId;
    }
    if (minRating) {
        where.rating = { gte: Number(minRating) };
    }
    // Build order by
    let orderBy = {};
    switch (sortBy) {
        case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
        case 'highest':
            orderBy = { rating: 'desc' };
            break;
        case 'lowest':
            orderBy = { rating: 'asc' };
            break;
        case 'helpful':
            orderBy = { helpfulCount: 'desc' };
            break;
        case 'newest':
        default:
            orderBy = { createdAt: 'desc' };
    }
    const [reviews, total] = await Promise.all([
        database_1.prisma.review.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
                website: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        thumbnail: true,
                    },
                },
            },
        }),
        database_1.prisma.review.count({ where }),
    ]);
    const totalPages = Math.ceil(total / take);
    res.status(200).json({
        success: true,
        data: {
            reviews,
            pagination: {
                page: Number(page),
                limit: take,
                total,
                totalPages,
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1,
            },
        },
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Get review by ID
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
exports.getReviewById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const review = await database_1.prisma.review.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                },
            },
            website: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    thumbnail: true,
                },
            },
        },
    });
    if (!review) {
        throw new errors_1.NotFoundError('Review not found');
    }
    res.status(200).json({
        success: true,
        data: { review },
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Create review
 * @route   POST /api/v1/reviews
 * @access  Private
 */
exports.createReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const { websiteId, rating, title, content } = req.body;
    // Validation
    if (!websiteId || !rating || !title || !content) {
        throw new errors_1.ValidationError('All fields are required');
    }
    if (rating < 1 || rating > 5) {
        throw new errors_1.ValidationError('Rating must be between 1 and 5');
    }
    if (title.length < 3 || title.length > 100) {
        throw new errors_1.ValidationError('Title must be between 3 and 100 characters');
    }
    if (content.length < 10) {
        throw new errors_1.ValidationError('Review content must be at least 10 characters');
    }
    // Check if website exists
    const website = await database_1.prisma.website.findUnique({
        where: { id: websiteId },
    });
    if (!website) {
        throw new errors_1.NotFoundError('Website not found');
    }
    // Check if user already reviewed this website
    const existingReview = await database_1.prisma.review.findUnique({
        where: {
            websiteId_userId: {
                websiteId,
                userId: req.user.id,
            },
        },
    });
    if (existingReview) {
        throw new errors_1.ConflictError('You have already reviewed this website');
    }
    // Create review
    const review = await database_1.prisma.review.create({
        data: {
            websiteId,
            userId: req.user.id,
            rating,
            title,
            content,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                },
            },
            website: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });
    // Update website rating and review count
    const websiteReviews = await database_1.prisma.review.findMany({
        where: { websiteId },
        select: { rating: true },
    });
    const avgRating = websiteReviews.length > 0
        ? websiteReviews.reduce((sum, r) => sum + r.rating, 0) / websiteReviews.length
        : 0;
    await database_1.prisma.website.update({
        where: { id: websiteId },
        data: {
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: websiteReviews.length,
        },
    });
    res.status(201).json({
        success: true,
        data: { review },
        message: 'Review created successfully',
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Update review
 * @route   PATCH /api/v1/reviews/:id
 * @access  Private (Review owner)
 */
exports.updateReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const { id } = req.params;
    const { rating, title, content } = req.body;
    // Check if review exists
    const review = await database_1.prisma.review.findUnique({
        where: { id },
    });
    if (!review) {
        throw new errors_1.NotFoundError('Review not found');
    }
    // Check ownership
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
        throw new errors_1.ForbiddenError('You can only update your own reviews');
    }
    // Validation
    if (rating !== undefined && (rating < 1 || rating > 5)) {
        throw new errors_1.ValidationError('Rating must be between 1 and 5');
    }
    if (title && (title.length < 3 || title.length > 100)) {
        throw new errors_1.ValidationError('Title must be between 3 and 100 characters');
    }
    if (content && content.length < 10) {
        throw new errors_1.ValidationError('Review content must be at least 10 characters');
    }
    // Update review
    const updatedReview = await database_1.prisma.review.update({
        where: { id },
        data: {
            ...(rating !== undefined && { rating }),
            ...(title && { title }),
            ...(content && { content }),
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                },
            },
            website: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });
    // Update website rating if rating changed
    if (rating !== undefined && rating !== review.rating) {
        const websiteReviews = await database_1.prisma.review.findMany({
            where: { websiteId: review.websiteId },
            select: { rating: true },
        });
        const avgRating = websiteReviews.length > 0
            ? websiteReviews.reduce((sum, r) => sum + r.rating, 0) / websiteReviews.length
            : 0;
        await database_1.prisma.website.update({
            where: { id: review.websiteId },
            data: {
                rating: Math.round(avgRating * 10) / 10,
            },
        });
    }
    res.status(200).json({
        success: true,
        data: { review: updatedReview },
        message: 'Review updated successfully',
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private (Review owner or Admin)
 */
exports.deleteReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const { id } = req.params;
    // Check if review exists
    const review = await database_1.prisma.review.findUnique({
        where: { id },
    });
    if (!review) {
        throw new errors_1.NotFoundError('Review not found');
    }
    // Check ownership or admin
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
        throw new errors_1.ForbiddenError('You can only delete your own reviews');
    }
    const websiteId = review.websiteId;
    // Delete review
    await database_1.prisma.review.delete({
        where: { id },
    });
    // Update website rating and review count
    const remainingReviews = await database_1.prisma.review.findMany({
        where: { websiteId },
        select: { rating: true },
    });
    const avgRating = remainingReviews.length > 0
        ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
        : 0;
    await database_1.prisma.website.update({
        where: { id: websiteId },
        data: {
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: remainingReviews.length,
        },
    });
    res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Get my reviews
 * @route   GET /api/v1/reviews/my-reviews
 * @access  Private
 */
exports.getMyReviews = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.NotFoundError('User not found');
    }
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const [reviews, total] = await Promise.all([
        database_1.prisma.review.findMany({
            where: { userId: req.user.id },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                website: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        thumbnail: true,
                        category: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        }),
        database_1.prisma.review.count({ where: { userId: req.user.id } }),
    ]);
    const totalPages = Math.ceil(total / take);
    res.status(200).json({
        success: true,
        data: {
            reviews,
            pagination: {
                page: Number(page),
                limit: take,
                total,
                totalPages,
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1,
            },
        },
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=review.controller.js.map