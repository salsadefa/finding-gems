// ============================================
// Creator Application Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { ForbiddenError, NotFoundError, BadRequestError } from '../utils/errors';

// Types
interface CreateApplicationBody {
  bio: string;
  professionalBackground?: string;
  expertise?: string[];
  portfolioUrl?: string;
  motivation: string;
}

interface RejectApplicationBody {
  reason?: string;
}

/**
 * Get current user's creator application
 */
export const getMyApplication = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const { data: application, error } = await supabase
    .from('creator_applications')
    .select('*')
    .eq('userId', req.user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!application) {
    res.status(404).json({
      success: false,
      error: { message: 'No application found' }
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: application.id,
      userId: application.userId,
      bio: application.bio,
      professionalBackground: application.professionalBackground,
      expertise: application.expertise || [],
      portfolioUrl: application.portfolioUrl,
      motivation: application.motivation,
      status: application.status,
      createdAt: application.createdAt,
      reviewedAt: application.reviewedAt,
      reviewedBy: application.reviewedBy,
      rejectionReason: application.rejectionReason,
    }
  });
});

/**
 * Submit a new creator application
 */
export const createApplication = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  // Check if user is already a creator
  if (req.user.role === 'creator') {
    throw new BadRequestError('You are already a creator');
  }

  // Check if user already has a pending application
  const { data: existingApp } = await supabase
    .from('creator_applications')
    .select('id, status')
    .eq('userId', req.user.id)
    .single();

  if (existingApp) {
    if (existingApp.status === 'pending') {
      throw new BadRequestError('You already have a pending application');
    }
    if (existingApp.status === 'approved') {
      throw new BadRequestError('Your application has already been approved');
    }
    // If rejected, allow reapplication by deleting the old one
    if (existingApp.status === 'rejected') {
      await supabase
        .from('creator_applications')
        .delete()
        .eq('id', existingApp.id);
    }
  }

  const { bio, professionalBackground, expertise, portfolioUrl, motivation } = 
    req.body as CreateApplicationBody;

  // Validation
  if (!bio || bio.trim().length < 50) {
    throw new BadRequestError('Bio must be at least 50 characters');
  }

  if (!motivation || motivation.trim().length < 100) {
    throw new BadRequestError('Motivation must be at least 100 characters');
  }

  // Validate portfolio URL if provided
  if (portfolioUrl && portfolioUrl.trim()) {
    try {
      new URL(portfolioUrl);
    } catch {
      throw new BadRequestError('Portfolio URL must be a valid URL');
    }
  }

  const { data: application, error } = await supabase
    .from('creator_applications')
    .insert({
      userId: req.user.id,
      bio: bio.trim(),
      professionalBackground: professionalBackground?.trim() || null,
      expertise: expertise || [],
      portfolioUrl: portfolioUrl?.trim() || null,
      motivation: motivation.trim(),
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: {
      id: application.id,
      userId: application.userId,
      bio: application.bio,
      professionalBackground: application.professionalBackground,
      expertise: application.expertise || [],
      portfolioUrl: application.portfolioUrl,
      motivation: application.motivation,
      status: application.status,
      createdAt: application.createdAt,
    }
  });
});

/**
 * Get all creator applications (admin only)
 */
export const getApplications = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  const { status, page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('creator_applications')
    .select('*, users!inner(name, email, username)', { count: 'exact' })
    .order('createdAt', { ascending: false })
    .range(offset, offset + limitNum - 1);

  if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
    query = query.eq('status', status);
  }

  const { data: applications, error, count } = await query;

  if (error) throw error;

  const formattedApplications = (applications || []).map((app: any) => ({
    id: app.id,
    userId: app.userId,
    user: {
      name: app.users?.name,
      email: app.users?.email,
      username: app.users?.username,
    },
    bio: app.bio,
    professionalBackground: app.professionalBackground,
    expertise: app.expertise || [],
    portfolioUrl: app.portfolioUrl,
    motivation: app.motivation,
    status: app.status,
    createdAt: app.createdAt,
    reviewedAt: app.reviewedAt,
    reviewedBy: app.reviewedBy,
    rejectionReason: app.rejectionReason,
  }));

  res.json({
    success: true,
    data: formattedApplications,
    pagination: {
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    }
  });
});

/**
 * Approve a creator application (admin only)
 */
export const approveApplication = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  const { id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new BadRequestError('Invalid application ID format');
  }

  // Get application
  const { data: application, error: fetchError } = await supabase
    .from('creator_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !application) {
    throw new NotFoundError('Application not found');
  }

  if (application.status !== 'pending') {
    throw new BadRequestError('Only pending applications can be approved');
  }

  // Update application status
  const { error: updateAppError } = await supabase
    .from('creator_applications')
    .update({
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user.id,
    })
    .eq('id', id);

  if (updateAppError) throw updateAppError;

  // Update user role to creator
  const { error: updateUserError } = await supabase
    .from('users')
    .update({ role: 'creator' })
    .eq('id', application.userId);

  if (updateUserError) throw updateUserError;

  // Create creator profile
  const { error: profileError } = await supabase
    .from('creator_profiles')
    .insert({
      userId: application.userId,
      bio: application.bio,
      professionalBackground: application.professionalBackground,
      expertise: application.expertise || [],
      portfolioUrl: application.portfolioUrl,
      isVerified: false,
    });

  if (profileError && profileError.code !== '23505') {
    // 23505 is unique violation - profile might already exist
    throw profileError;
  }

  res.json({
    success: true,
    message: 'Application approved successfully',
  });
});

/**
 * Reject a creator application (admin only)
 */
export const rejectApplication = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  const { id } = req.params;
  const { reason } = req.body as RejectApplicationBody;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new BadRequestError('Invalid application ID format');
  }

  // Get application
  const { data: application, error: fetchError } = await supabase
    .from('creator_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !application) {
    throw new NotFoundError('Application not found');
  }

  if (application.status !== 'pending') {
    throw new BadRequestError('Only pending applications can be rejected');
  }

  // Update application status
  const { error: updateError } = await supabase
    .from('creator_applications')
    .update({
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user.id,
      rejectionReason: reason?.trim() || null,
    })
    .eq('id', id);

  if (updateError) throw updateError;

  res.json({
    success: true,
    message: 'Application rejected',
  });
});
