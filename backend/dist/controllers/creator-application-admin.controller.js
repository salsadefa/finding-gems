"use strict";
// ============================================
// Creator Application Admin Controller
// Admin endpoints for managing creator applications
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreatorApplicationStats = exports.handleCreatorApplication = exports.getCreatorApplicationById = exports.getAllCreatorApplications = void 0;
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
const errors_1 = require("../utils/errors");
/**
 * Check if user is admin
 */
const requireAdmin = (req) => {
    if (!req.user) {
        throw new errors_1.ForbiddenError('Authentication required');
    }
    if (req.user.role !== 'admin') {
        throw new errors_1.ForbiddenError('Admin access required');
    }
};
/**
 * @desc    Get all creator applications
 * @route   GET /api/v1/admin/creator-applications
 * @access  Private (Admin only)
 */
exports.getAllCreatorApplications = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const { page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    let query = supabase_1.supabase
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
    if (error)
        throw error;
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
exports.getCreatorApplicationById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const { id } = req.params;
    const { data: application, error } = await supabase_1.supabase
        .from('creator_applications')
        .select(`
      *,
      user:users!creator_applications_userId_fkey(id, name, username, email, avatar, role, bio, "createdAt"),
      reviewer:users!creator_applications_reviewedBy_fkey(id, name, email)
    `)
        .eq('id', id)
        .single();
    if (error || !application) {
        throw new errors_1.NotFoundError('Creator application not found');
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
exports.handleCreatorApplication = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    // Validate status
    const validStatuses = ['approved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
        throw new errors_1.ValidationError('Invalid status. Must be: approved or rejected');
    }
    // Check if application exists
    const { data: existingApp, error: findError } = await supabase_1.supabase
        .from('creator_applications')
        .select('id, status, "userId"')
        .eq('id', id)
        .single();
    if (findError || !existingApp) {
        throw new errors_1.NotFoundError('Creator application not found');
    }
    // Prevent re-processing
    if (existingApp.status !== 'pending') {
        throw new errors_1.ValidationError('This application has already been processed');
    }
    // Require rejection reason if rejecting
    if (status === 'rejected' && !rejectionReason) {
        throw new errors_1.ValidationError('Rejection reason is required when rejecting an application');
    }
    // Update application status
    const updateData = {
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: req.user.id,
    };
    if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
    }
    const { error: updateError } = await supabase_1.supabase
        .from('creator_applications')
        .update(updateData)
        .eq('id', id);
    if (updateError)
        throw updateError;
    // If approved, update user role to 'creator' and create creator profile
    if (status === 'approved') {
        // Update user role
        const { error: roleError } = await supabase_1.supabase
            .from('users')
            .update({ role: 'creator' })
            .eq('id', existingApp.userId);
        if (roleError)
            throw roleError;
        // Create creator profile from application data
        const { data: appData } = await supabase_1.supabase
            .from('creator_applications')
            .select('bio, "professionalBackground", expertise, "portfolioUrl"')
            .eq('id', id)
            .single();
        if (appData) {
            const { error: profileError } = await supabase_1.supabase
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
        await supabase_1.supabase
            .from('creator_balances')
            .upsert({
            creator_id: existingApp.userId,
            available_balance: 0,
            pending_balance: 0,
            total_earned: 0,
        }, { onConflict: 'creator_id' });
    }
    // Fetch updated application
    const { data: application, error: fetchError } = await supabase_1.supabase
        .from('creator_applications')
        .select(`
      *,
      user:users!creator_applications_userId_fkey(id, name, username, email, avatar, role)
    `)
        .eq('id', id)
        .single();
    if (fetchError)
        throw fetchError;
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
exports.getCreatorApplicationStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const [{ count: totalApplications }, { count: pendingApplications }, { count: approvedApplications }, { count: rejectedApplications },] = await Promise.all([
        supabase_1.supabase.from('creator_applications').select('*', { count: 'exact', head: true }),
        supabase_1.supabase.from('creator_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase_1.supabase.from('creator_applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase_1.supabase.from('creator_applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
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
//# sourceMappingURL=creator-application-admin.controller.js.map