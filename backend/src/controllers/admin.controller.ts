// ============================================
// Admin Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import {
  PlatformStats,
  WebsiteModeration,
  UserModeration,
  ReportAction,
  AdminFilters,
} from '../types/admin.types';

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
 * @desc    Get platform statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin only)
 */
export const getPlatformStats = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  // Get current date for "this month" calculations
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Parallel queries for stats
  const [
    { count: totalWebsites },
    { count: totalUsers },
    { count: totalCreators },
    { count: totalBuyers },
    { count: pendingWebsites },
    { count: pendingApplications },
    { count: pendingReports },
    { count: websitesThisMonth },
    { count: usersThisMonth },
  ] = await Promise.all([
    // Total websites
    supabase.from('websites').select('*', { count: 'exact', head: true }),
    // Total users
    supabase.from('users').select('*', { count: 'exact', head: true }),
    // Total creators
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'creator'),
    // Total buyers
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
    // Pending websites
    supabase.from('websites').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    // Pending creator applications
    supabase.from('creator_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    // Pending reports
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    // Websites this month
    supabase.from('websites').select('*', { count: 'exact', head: true }).gte('createdAt', startOfMonth),
    // Users this month
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('createdAt', startOfMonth),
  ]);

  const stats: PlatformStats = {
    totalWebsites: totalWebsites || 0,
    totalUsers: totalUsers || 0,
    totalCreators: totalCreators || 0,
    totalBuyers: totalBuyers || 0,
    pendingWebsites: pendingWebsites || 0,
    pendingApplications: pendingApplications || 0,
    pendingReports: pendingReports || 0,
    websitesThisMonth: websitesThisMonth || 0,
    usersThisMonth: usersThisMonth || 0,
  };

  res.status(200).json({
    success: true,
    data: { stats },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get all pending websites for moderation
 * @route   GET /api/v1/admin/websites/pending
 * @access  Private (Admin only)
 */
export const getPendingWebsites = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  const { page = 1, limit = 20 } = req.query as AdminFilters;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const { data: websites, error, count } = await supabase
    .from('websites')
    .select(`
      *,
      creator:users(id, name, username, email, avatar),
      category:categories(id, name, slug)
    `, { count: 'exact' })
    .eq('status', 'pending')
    .order('createdAt', { ascending: false })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      websites: websites || [],
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
 * @desc    Moderate a website (approve/reject/suspend)
 * @route   PATCH /api/v1/admin/websites/:id/moderate
 * @access  Private (Admin only)
 */
export const moderateWebsite = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  const { id } = req.params;
  const { status, adminNote } = req.body as WebsiteModeration;

  // Validate status
  const validStatuses = ['pending', 'active', 'suspended', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    throw new ValidationError('Invalid status. Must be: pending, active, suspended, or rejected');
  }

  // Check if website exists
  const { data: existingWebsite, error: findError } = await supabase
    .from('websites')
    .select('id, status, creator_id')
    .eq('id', id)
    .single();

  if (findError || !existingWebsite) {
    throw new NotFoundError('Website not found');
  }

  // Update website status
  const updateData: Record<string, unknown> = {
    status,
    moderated_at: new Date().toISOString(),
    moderated_by: req.user!.id,
  };

  if (adminNote) {
    updateData.admin_note = adminNote;
  }

  const { data: website, error } = await supabase
    .from('websites')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      creator:users(id, name, username, avatar),
      category:categories(id, name, slug)
    `)
    .single();

  if (error) throw error;

  res.status(200).json({
    success: true,
    data: { website },
    message: `Website ${status === 'active' ? 'approved' : status}`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get all users for admin management
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin only)
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  const {
    page = 1,
    limit = 20,
    role,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query as AdminFilters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' });

  // Filter by role
  if (role) {
    query = query.eq('role', role);
  }

  // Search by name, username, or email
  if (search) {
    query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: users, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      users: users || [],
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
 * @desc    Update user role or status (ban/unban)
 * @route   PATCH /api/v1/admin/users/:id
 * @access  Private (Admin only)
 */
export const updateUserAdmin = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  const { id } = req.params;
  const { role, isActive, adminNote } = req.body as UserModeration;

  // Check if user exists
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', id)
    .single();

  if (findError || !existingUser) {
    throw new NotFoundError('User not found');
  }

  // Prevent admin from changing their own role
  if (id === req.user!.id && role && role !== 'admin') {
    throw new ForbiddenError('Cannot change your own admin role');
  }

  // Build update data
  const updateData: Record<string, unknown> = {};

  if (role !== undefined) {
    const validRoles = ['visitor', 'buyer', 'creator', 'admin'];
    if (!validRoles.includes(role)) {
      throw new ValidationError('Invalid role');
    }
    updateData.role = role;
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  if (adminNote) {
    updateData.admin_note = adminNote;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('No valid fields to update');
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('id, email, name, username, role, isActive, avatar, createdAt')
    .single();

  if (error) throw error;

  res.status(200).json({
    success: true,
    data: { user },
    message: 'User updated successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get all reports
 * @route   GET /api/v1/admin/reports
 * @access  Private (Admin only)
 */
export const getReports = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  const {
    page = 1,
    limit = 20,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query as AdminFilters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let query = supabase
    .from('reports')
    .select(`
      *,
      website:websites(id, name, slug, thumbnail),
      reporter:users!reports_reporter_id_fkey(id, name, username, avatar)
    `, { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: reports, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      reports: reports || [],
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
 * @desc    Take action on a report
 * @route   PATCH /api/v1/admin/reports/:id
 * @access  Private (Admin only)
 */
export const handleReport = catchAsync(async (req: Request, res: Response) => {
  requireAdmin(req);

  const { id } = req.params;
  const { status, resolution } = req.body as ReportAction;

  // Validate status
  const validStatuses = ['reviewed', 'resolved', 'dismissed'];
  if (!status || !validStatuses.includes(status)) {
    throw new ValidationError('Invalid status. Must be: reviewed, resolved, or dismissed');
  }

  // Check if report exists
  const { data: existingReport, error: findError } = await supabase
    .from('reports')
    .select('id, status')
    .eq('id', id)
    .single();

  if (findError || !existingReport) {
    throw new NotFoundError('Report not found');
  }

  // Update report
  const updateData: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
    reviewed_by: req.user!.id,
  };

  if (resolution) {
    updateData.resolution = resolution;
  }

  const { data: report, error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      website:websites(id, name, slug),
      reporter:users!reports_reporter_id_fkey(id, name, username)
    `)
    .single();

  if (error) throw error;

  res.status(200).json({
    success: true,
    data: { report },
    message: `Report ${status}`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get all websites with filters (admin view - includes all statuses)
 * @route   GET /api/v1/admin/websites
 * @access  Private (Admin only)
 */
export const getAllWebsitesAdmin = catchAsync(async (req: Request, res: Response) => {
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
    .from('websites')
    .select(`
      *,
      creator:users(id, name, username, avatar),
      category:categories(id, name, slug)
    `, { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: websites, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      websites: websites || [],
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
