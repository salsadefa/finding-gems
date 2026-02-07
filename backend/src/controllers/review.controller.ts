// ============================================
// Review Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
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

  // Build query
  let query = supabase
    .from('reviews')
    .select(`
      *,
      user:users(id, name, username, avatar),
      website:websites(id, name, slug, thumbnail)
    `, { count: 'exact' });

  if (websiteId) {
    query = query.eq('websiteId', websiteId);
  }

  if (userId) {
    query = query.eq('userId', userId);
  }

  if (minRating) {
    query = query.gte('rating', Number(minRating));
  }

  // Build order by
  let orderColumn = 'createdAt';
  let ascending = false;
  switch (sortBy) {
    case 'oldest':
      orderColumn = 'createdAt';
      ascending = true;
      break;
    case 'highest':
      orderColumn = 'rating';
      ascending = false;
      break;
    case 'lowest':
      orderColumn = 'rating';
      ascending = true;
      break;
    case 'newest':
    default:
      orderColumn = 'createdAt';
      ascending = false;
  }

  const { data: reviews, error, count } = await query
    .order(orderColumn, { ascending })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      reviews: reviews || [],
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

  const { data: review, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:users(id, name, username, avatar),
      website:websites(id, name, slug, thumbnail)
    `)
    .eq('id', id)
    .single();

  if (error || !review) {
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
  const { data: website, error: websiteError } = await supabase
    .from('websites')
    .select('id')
    .eq('id', websiteId)
    .single();

  if (websiteError || !website) {
    throw new NotFoundError('Website not found');
  }

  // Check if user already reviewed this website
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('websiteId', websiteId)
    .eq('userId', req.user.id)
    .single();

  if (existingReview) {
    throw new ConflictError('You have already reviewed this website');
  }

  // Check if user has purchased this website (must have paid order)
  const { data: purchase } = await supabase
    .from('orders')
    .select('id')
    .eq('buyer_id', req.user.id)
    .eq('website_id', websiteId)
    .eq('status', 'paid')
    .single();

  if (!purchase) {
    throw new ForbiddenError('You must purchase this website before leaving a review');
  }

  // Create review
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      websiteId,
      userId: req.user.id,
      rating,
      title: title.trim(),
      content: content.trim(),
    })
    .select(`
      *,
      user:users(id, name, username, avatar),
      website:websites(id, name, slug)
    `)
    .single();

  if (error) throw error;

  // Update website rating and review count
  const { data: websiteReviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('websiteId', websiteId);

  const avgRating = websiteReviews && websiteReviews.length > 0
    ? websiteReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / websiteReviews.length
    : 0;

  await supabase
    .from('websites')
    .update({
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: websiteReviews?.length || 0,
    })
    .eq('id', websiteId);

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
  const { data: review, error: findError } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !review) {
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

  // Build update data
  const updateData: any = {};
  if (rating !== undefined) updateData.rating = rating;
  if (title) updateData.title = title.trim();
  if (content) updateData.content = content.trim();

  // Update review
  const { data: updatedReview, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      user:users(id, name, username, avatar),
      website:websites(id, name, slug)
    `)
    .single();

  if (error) throw error;

  // Update website rating if rating changed
  if (rating !== undefined && rating !== review.rating) {
    const { data: websiteReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('websiteId', review.websiteId);

    const avgRating = websiteReviews && websiteReviews.length > 0
      ? websiteReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / websiteReviews.length
      : 0;

    await supabase
      .from('websites')
      .update({
        rating: Math.round(avgRating * 10) / 10,
      })
      .eq('id', review.websiteId);
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
  const { data: review, error: findError } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !review) {
    throw new NotFoundError('Review not found');
  }

  // Check ownership or admin
  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    throw new ForbiddenError('You can only delete your own reviews');
  }

  const websiteId = review.websiteId;

  // Delete review
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) throw error;

  // Update website rating and review count
  const { data: remainingReviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('websiteId', websiteId);

  const avgRating = remainingReviews && remainingReviews.length > 0
    ? remainingReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / remainingReviews.length
    : 0;

  await supabase
    .from('websites')
    .update({
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: remainingReviews?.length || 0,
    })
    .eq('id', websiteId);

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

  const { data: reviews, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      website:websites(id, name, slug, thumbnail, category:categories(name))
    `, { count: 'exact' })
    .eq('userId', req.user.id)
    .order('createdAt', { ascending: false })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      reviews: reviews || [],
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
