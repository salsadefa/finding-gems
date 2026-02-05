// ============================================
// Creator Application Admin Controller
// Admin endpoints for managing creator applications
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';

interface AdminFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Check if user is admin
 */
const requireAdmin = (req: Request) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }
  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }
};

/**
 * @desc    Get all creator applications
 * @route   GET /api/v1/admin/creator-applications
 * @access  Private (Admin only)
 */
export const getAllCreatorApplications = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  const {
    page = 1,
    limit = 20,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query as AdminFilters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let query = supabase
    .from('creator_applications')
    .select(`
      *,
      user:users!creator_applications_userId_fkey(id, name, username, email, avatar, role, "createdAt")
    `, { count: 'exact' });

  // Filter by status
  if (status) {
    query = query.eq('status', status);
  }

  // Search by user name or email
  if (search) {
    // Note: Search on joined table requires separate query or RPC
    // For now, we'll filter after fetch for simplicity
  }

  const { data: applications, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      applications: applications || [],
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
 * @desc    Get single creator application details
 * @route   GET /api/v1/admin/creator-applications/:id
 * @access  Private (Admin only)
 */
export const getCreatorApplicationById = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  const { id } = req.params;

  const { data: application, error } = await supabase
    .from('creator_applications')
    .select(`
      *,
      user:users!creator_applications_userId_fkey(id, name, username, email, avatar, role, bio, "createdAt"),
      reviewer:users!creator_applications_reviewedBy_fkey(id, name, email)
    `)
    .eq('id', id)
    .single();

  if (error || !application) {
    throw new NotFoundError('Creator application not found');
  }

  res.status(200).json({
    success: true,
    data: { application },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Approve or reject creator application
 * @route   PATCH /api/v1/admin/creator-applications/:id
 * @access  Private (Admin only)
 */
export const handleCreatorApplication = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  // Validate status
  const validStatuses = ['approved', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    throw new ValidationError('Invalid status. Must be: approved or rejected');
  }

  // Check if application exists
  const { data: existingApp, error: findError } = await supabase
    .from('creator_applications')
    .select('id, status, "userId"')
    .eq('id', id)
    .single();

  if (findError || !existingApp) {
    throw new NotFoundError('Creator application not found');
  }

  // Prevent re-processing
  if (existingApp.status !== 'pending') {
    throw new ValidationError('This application has already been processed');
  }

  // Require rejection reason if rejecting
  if (status === 'rejected' && !rejectionReason) {
    throw new ValidationError('Rejection reason is required when rejecting an application');
  }

  // Update application status
  const updateData: Record<string, unknown> = {
    status,
    reviewedAt: new Date().toISOString(),
    reviewedBy: req.user!.id,
  };

  if (status === 'rejected' && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  const { error: updateError } = await supabase
    .from('creator_applications')
    .update(updateData)
    .eq('id', id);

  if (updateError) throw updateError;

  // If approved, update user role to 'creator' and create creator profile
  if (status === 'approved') {
    // Update user role
    const { error: roleError } = await supabase
      .from('users')
      .update({ role: 'creator' })
      .eq('id', existingApp.userId);

    if (roleError) throw roleError;

    // Create creator profile from application data
    const { data: appData } = await supabase
      .from('creator_applications')
      .select('bio, "professionalBackground", expertise, "portfolioUrl"')
      .eq('id', id)
      .single();

    if (appData) {
      const { error: profileError } = await supabase
        .from('creator_profiles')
        .upsert({
          userId: existingApp.userId,
          bio: appData.bio,
          professionalBackground: appData.professionalBackground,
          expertise: appData.expertise || [],
          portfolioUrl: appData.portfolioUrl,
          isVerified: true,
        }, { onConflict: 'userId' });

      if (profileError) {
        console.error('Failed to create creator profile:', profileError);
        // Don't throw - application is already approved
      }
    }

    // Create initial creator balance record
    await supabase
      .from('creator_balances')
      .upsert({
        creator_id: existingApp.userId,
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0,
      }, { onConflict: 'creator_id' });
  }

  // Fetch updated application
  const { data: application, error: fetchError } = await supabase
    .from('creator_applications')
    .select(`
      *,
      user:users!creator_applications_userId_fkey(id, name, username, email, avatar, role)
    `)
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  res.status(200).json({
    success: true,
    data: { application },
    message: `Creator application ${status}`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get creator application statistics
 * @route   GET /api/v1/admin/creator-applications/stats
 * @access  Private (Admin only)
 */
export const getCreatorApplicationStats = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  const [
    { count: totalApplications },
    { count: pendingApplications },
    { count: approvedApplications },
    { count: rejectedApplications },
  ] = await Promise.all([
    supabase.from('creator_applications').select('*', { count: 'exact', head: true }),
    supabase.from('creator_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('creator_applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('creator_applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: totalApplications || 0,
      pending: pendingApplications || 0,
      approved: approvedApplications || 0,
      rejected: rejectedApplications || 0,
    },
    timestamp: new Date().toISOString(),
  });
});
