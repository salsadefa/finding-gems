"use strict";
// ============================================
// Admin Controller - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWebsitesAdmin = exports.handleReport = exports.getReports = exports.updateUserAdmin = exports.getAllUsers = exports.moderateWebsite = exports.getPendingWebsites = exports.getPlatformStats = void 0;
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
 * @desc    Get platform statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin only)
 */
exports.getPlatformStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    // Get current date for "this month" calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    // Parallel queries for stats
    const [{ count: totalWebsites }, { count: totalUsers }, { count: totalCreators }, { count: totalBuyers }, { count: pendingWebsites }, { count: pendingApplications }, { count: pendingReports }, { count: websitesThisMonth }, { count: usersThisMonth },] = await Promise.all([
        // Total websites
        supabase_1.supabase.from('websites').select('*', { count: 'exact', head: true }),
        // Total users
        supabase_1.supabase.from('users').select('*', { count: 'exact', head: true }),
        // Total creators
        supabase_1.supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'creator'),
        // Total buyers
        supabase_1.supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
        // Pending websites
        supabase_1.supabase.from('websites').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        // Pending creator applications
        supabase_1.supabase.from('creator_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        // Pending reports
        supabase_1.supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        // Websites this month
        supabase_1.supabase.from('websites').select('*', { count: 'exact', head: true }).gte('createdAt', startOfMonth),
        // Users this month
        supabase_1.supabase.from('users').select('*', { count: 'exact', head: true }).gte('createdAt', startOfMonth),
    ]);
    const stats = {
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
exports.getPendingWebsites = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const { data: websites, error, count } = await supabase_1.supabase
        .from('websites')
        .select(`
      *,
      creator:users(id, name, username, email, avatar),
      category:categories(id, name, slug)
    `, { count: 'exact' })
        .eq('status', 'pending')
        .order('createdAt', { ascending: false })
        .range(skip, skip + take - 1);
    if (error)
        throw error;
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
exports.moderateWebsite = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const { id } = req.params;
    const { status, adminNote } = req.body;
    // Validate status
    const validStatuses = ['pending', 'active', 'suspended', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
        throw new errors_1.ValidationError('Invalid status. Must be: pending, active, suspended, or rejected');
    }
    // Check if website exists
    const { data: existingWebsite, error: findError } = await supabase_1.supabase
        .from('websites')
        .select('id, status, creator_id')
        .eq('id', id)
        .single();
    if (findError || !existingWebsite) {
        throw new errors_1.NotFoundError('Website not found');
    }
    // Update website status
    const updateData = {
        status,
        moderated_at: new Date().toISOString(),
        moderated_by: req.user.id,
    };
    // Note: admin_note field removed - not in current schema
    // if (adminNote) {
    //   updateData.admin_note = adminNote;
    // }
    const { data: website, error } = await supabase_1.supabase
        .from('websites')
        .update(updateData)
        .eq('id', id)
        .select(`
      *,
      creator:users(id, name, username, avatar),
      category:categories(id, name, slug)
    `)
        .single();
    if (error)
        throw error;
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
exports.getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const { page = 1, limit = 20, role, search, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    let query = supabase_1.supabase
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
    if (error)
        throw error;
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
exports.updateUserAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const { id } = req.params;
    const { role, isActive, adminNote } = req.body;
    // Check if user exists
    const { data: existingUser, error: findError } = await supabase_1.supabase
        .from('users')
        .select('id, role')
        .eq('id', id)
        .single();
    if (findError || !existingUser) {
        throw new errors_1.NotFoundError('User not found');
    }
    // Prevent admin from changing their own role
    if (id === req.user.id && role && role !== 'admin') {
        throw new errors_1.ForbiddenError('Cannot change your own admin role');
    }
    // Build update data
    const updateData = {};
    if (role !== undefined) {
        const validRoles = ['visitor', 'buyer', 'creator', 'admin'];
        if (!validRoles.includes(role)) {
            throw new errors_1.ValidationError('Invalid role');
        }
        updateData.role = role;
    }
    if (isActive !== undefined) {
        updateData.isActive = isActive;
    }
    // Note: admin_note field removed - not in current schema
    // if (adminNote) {
    //   updateData.admin_note = adminNote;
    // }
    if (Object.keys(updateData).length === 0) {
        throw new errors_1.ValidationError('No valid fields to update');
    }
    const { data: user, error } = await supabase_1.supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select('id, email, name, username, role, isActive, avatar, createdAt')
        .single();
    if (error)
        throw error;
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
exports.getReports = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    let query = supabase_1.supabase
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
    if (error)
        throw error;
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
exports.handleReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const { id } = req.params;
    const { status, resolution } = req.body;
    // Validate status
    const validStatuses = ['reviewed', 'resolved', 'dismissed'];
    if (!status || !validStatuses.includes(status)) {
        throw new errors_1.ValidationError('Invalid status. Must be: reviewed, resolved, or dismissed');
    }
    // Check if report exists
    const { data: existingReport, error: findError } = await supabase_1.supabase
        .from('reports')
        .select('id, status')
        .eq('id', id)
        .single();
    if (findError || !existingReport) {
        throw new errors_1.NotFoundError('Report not found');
    }
    // Update report
    const updateData = {
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: req.user.id,
    };
    if (resolution) {
        updateData.resolution = resolution;
    }
    const { data: report, error } = await supabase_1.supabase
        .from('reports')
        .update(updateData)
        .eq('id', id)
        .select(`
      *,
      website:websites(id, name, slug),
      reporter:users!reports_reporter_id_fkey(id, name, username)
    `)
        .single();
    if (error)
        throw error;
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
exports.getAllWebsitesAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    requireAdmin(req);
    const { page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    let query = supabase_1.supabase
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
    if (error)
        throw error;
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
//# sourceMappingURL=admin.controller.js.map