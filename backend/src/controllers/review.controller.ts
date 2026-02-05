// ============================================
// Review Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { catchAsync } from '../utils/catchAsync';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../utils/errors';
import {
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewFilters,
  PaginationParams,
} from '../types/review.types';

/**
 * @desc    Get reviews with filters and pagination
 * @route   GET /api/v1/reviews
 * @access  Public
 */
export const getReviews = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    websiteId,
    userId,
    minRating,
    sortBy = 'newest',
  } = req.query as PaginationParams & ReviewFilters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = {};

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
  let orderBy: any = {};
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
    prisma.review.findMany({
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
    prisma.review.count({ where }),
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
export const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await prisma.review.findUnique({
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
    throw new NotFoundError('Review not found');
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
export const createReview = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { websiteId, rating, title, content } = req.body as CreateReviewRequest;

  // Validation
  if (!websiteId || !rating || !title || !content) {
    throw new ValidationError('All fields are required');
  }

  if (rating < 1 || rating > 5) {
    throw new ValidationError('Rating must be between 1 and 5');
  }

  if (title.length < 3 || title.length > 100) {
    throw new ValidationError('Title must be between 3 and 100 characters');
  }

  if (content.length < 10) {
    throw new ValidationError('Review content must be at least 10 characters');
  }

  // Check if website exists
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
  });

  if (!website) {
    throw new NotFoundError('Website not found');
  }

  // Check if user already reviewed this website
  const existingReview = await prisma.review.findUnique({
    where: {
      websiteId_userId: {
        websiteId,
        userId: req.user.id,
      },
    },
  });

  if (existingReview) {
    throw new ConflictError('You have already reviewed this website');
  }

  // Create review
  const review = await prisma.review.create({
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
  const websiteReviews = await prisma.review.findMany({
    where: { websiteId },
    select: { rating: true },
  });

  const avgRating = websiteReviews.length > 0
    ? websiteReviews.reduce((sum, r) => sum + r.rating, 0) / websiteReviews.length
    : 0;

  await prisma.website.update({
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
export const updateReview = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { id } = req.params;
  const { rating, title, content } = req.body as UpdateReviewRequest;

  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  // Check ownership
  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    throw new ForbiddenError('You can only update your own reviews');
  }

  // Validation
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw new ValidationError('Rating must be between 1 and 5');
  }

  if (title && (title.length < 3 || title.length > 100)) {
    throw new ValidationError('Title must be between 3 and 100 characters');
  }

  if (content && content.length < 10) {
    throw new ValidationError('Review content must be at least 10 characters');
  }

  // Update review
  const updatedReview = await prisma.review.update({
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
    const websiteReviews = await prisma.review.findMany({
      where: { websiteId: review.websiteId },
      select: { rating: true },
    });

    const avgRating = websiteReviews.length > 0
      ? websiteReviews.reduce((sum, r) => sum + r.rating, 0) / websiteReviews.length
      : 0;

    await prisma.website.update({
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
export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { id } = req.params;

  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  // Check ownership or admin
  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    throw new ForbiddenError('You can only delete your own reviews');
  }

  const websiteId = review.websiteId;

  // Delete review
  await prisma.review.delete({
    where: { id },
  });

  // Update website rating and review count
  const remainingReviews = await prisma.review.findMany({
    where: { websiteId },
    select: { rating: true },
  });

  const avgRating = remainingReviews.length > 0
    ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
    : 0;

  await prisma.website.update({
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
export const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { page = 1, limit = 10 } = req.query as PaginationParams;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
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
    prisma.review.count({ where: { userId: req.user.id } }),
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
