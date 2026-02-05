// ============================================
// Creator Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import { CreatorProfileData } from '../types/creator.types';

/**
 * @desc    Get all creators (public listing)
 * @route   GET /api/v1/creators
 * @access  Public
 */
export const getCreators = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    search,
    sortBy = 'rating',
    sortOrder = 'desc',
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let query = supabase
    .from('users')
    .select(`
      id, name, username, avatar, role, created_at,
      creator_profiles(
        bio,
        professional_background,
        expertise,
        portfolio_url,
        is_verified,
        total_websites,
        rating,
        review_count,
        social_links
      )
    `, { count: 'exact' })
    .eq('role', 'creator')
    .eq('is_active', true);

  if (search) {
    query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%`);
  }

  // Sort options
  const sortColumn = sortBy === 'rating' ? 'creator_profiles.rating' :
                     sortBy === 'websites' ? 'creator_profiles.total_websites' :
                     sortBy === 'newest' ? 'created_at' : 'name';

  const { data: creators, error, count } = await query
    .order(sortColumn as string, { ascending: sortOrder === 'asc' })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      creators: creators || [],
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
 * @desc    Get creator profile by ID or username
 * @route   GET /api/v1/creators/:idOrUsername
 * @access  Public
 */
export const getCreatorProfile = catchAsync(async (req: Request, res: Response) => {
  const { idOrUsername } = req.params;

  // Check if it's a UUID or username
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername);

  let query = supabase
    .from('users')
    .select(`
      id, name, username, avatar, role, created_at,
      creator_profiles(
        bio,
        professional_background,
        expertise,
        portfolio_url,
        is_verified,
        verified_at,
        total_websites,
        rating,
        review_count,
        social_links
      )
    `)
    .eq('role', 'creator')
    .eq('is_active', true);

  if (isUuid) {
    query = query.eq('id', idOrUsername);
  } else {
    query = query.eq('username', idOrUsername);
  }

  const { data: creator, error } = await query.single();

  if (error || !creator) {
    throw new NotFoundError('Creator not found');
  }

  // Get creator's active websites
  const { data: websites } = await supabase
    .from('websites')
    .select(`
      id, name, slug, thumbnail, short_description, rating, view_count,
      category:categories(id, name, slug)
    `)
    .eq('creator_id', creator.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      creator,
      websites: websites || [],
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get current creator's profile (authenticated)
 * @route   GET /api/v1/creators/me
 * @access  Private (Creator only)
 */
export const getMyCreatorProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  if (req.user.role !== 'creator' && req.user.role !== 'admin') {
    throw new ForbiddenError('Only creators can access this endpoint');
  }

  const { data: profile, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error || !profile) {
    // Return empty profile if not exists
    res.status(200).json({
      success: true,
      data: {
        profile: null,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { profile },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Update current creator's profile
 * @route   PATCH /api/v1/creators/me
 * @access  Private (Creator only)
 */
export const updateMyCreatorProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  if (req.user.role !== 'creator' && req.user.role !== 'admin') {
    throw new ForbiddenError('Only creators can update their profile');
  }

  const {
    bio,
    professionalBackground,
    expertise,
    portfolioUrl,
    socialLinks,
  } = req.body as CreatorProfileData;

  // Build update data
  const updateData: Record<string, unknown> = {};

  if (bio !== undefined) {
    if (bio.length > 1000) {
      throw new ValidationError('Bio must be less than 1000 characters');
    }
    updateData.bio = bio.trim();
  }

  if (professionalBackground !== undefined) {
    updateData.professional_background = professionalBackground.trim();
  }

  if (expertise !== undefined) {
    if (!Array.isArray(expertise)) {
      throw new ValidationError('Expertise must be an array');
    }
    updateData.expertise = expertise;
  }

  if (portfolioUrl !== undefined) {
    if (portfolioUrl && !/^https?:\/\/.+/.test(portfolioUrl)) {
      throw new ValidationError('Portfolio URL must be a valid URL');
    }
    updateData.portfolio_url = portfolioUrl;
  }

  if (socialLinks !== undefined) {
    updateData.social_links = socialLinks;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('No valid fields to update');
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', req.user.id)
    .single();

  let profile;

  if (existingProfile) {
    // Update existing profile
    const { data, error } = await supabase
      .from('creator_profiles')
      .update(updateData)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    profile = data;
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from('creator_profiles')
      .insert({
        user_id: req.user.id,
        ...updateData,
      })
      .select()
      .single();

    if (error) throw error;
    profile = data;
  }

  res.status(200).json({
    success: true,
    data: { profile },
    message: 'Profile updated successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get creator's dashboard stats
 * @route   GET /api/v1/creators/me/stats
 * @access  Private (Creator only)
 */
export const getCreatorStats = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  if (req.user.role !== 'creator' && req.user.role !== 'admin') {
    throw new ForbiddenError('Only creators can access this endpoint');
  }

  // Get website stats
  const { data: websites } = await supabase
    .from('websites')
    .select('id, status, view_count, click_count, rating, review_count')
    .eq('creator_id', req.user.id);

  const stats = {
    totalWebsites: websites?.length || 0,
    activeWebsites: websites?.filter(w => w.status === 'active').length || 0,
    pendingWebsites: websites?.filter(w => w.status === 'pending').length || 0,
    totalViews: websites?.reduce((sum, w) => sum + (w.view_count || 0), 0) || 0,
    totalClicks: websites?.reduce((sum, w) => sum + (w.click_count || 0), 0) || 0,
    averageRating: websites?.length 
      ? (websites.reduce((sum, w) => sum + (w.rating || 0), 0) / websites.length).toFixed(1)
      : 0,
    totalReviews: websites?.reduce((sum, w) => sum + (w.review_count || 0), 0) || 0,
  };

  res.status(200).json({
    success: true,
    data: { stats },
    timestamp: new Date().toISOString(),
  });
});
