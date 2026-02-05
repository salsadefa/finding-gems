"use strict";
// ============================================
// Report Controller - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportById = exports.getMyReports = exports.createReport = void 0;
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
const errors_1 = require("../utils/errors");
/**
 * @desc    Submit a report for a website
 * @route   POST /api/v1/reports
 * @access  Private (Authenticated users)
 */
exports.createReport = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.ForbiddenError('Authentication required');
    }
    const { websiteId, reason, description } = req.body;
    // Validate required fields
    if (!websiteId || !reason) {
        throw new errors_1.ValidationError('Website ID and reason are required');
    }
    // Validate reason
    const validReasons = [
        'spam',
        'inappropriate_content',
        'misleading_information',
        'broken_link',
        'copyright_violation',
        'scam',
        'other',
    ];
    if (!validReasons.includes(reason)) {
        throw new errors_1.ValidationError(`Invalid reason. Must be one of: ${validReasons.join(', ')}`);
    }
    // Check if website exists
    const { data: website, error: websiteError } = await supabase_1.supabase
        .from('websites')
        .select('id, name')
        .eq('id', websiteId)
        .single();
    if (websiteError || !website) {
        throw new errors_1.NotFoundError('Website not found');
    }
    // Check if user already reported this website
    const { data: existingReport } = await supabase_1.supabase
        .from('reports')
        .select('id')
        .eq('website_id', websiteId)
        .eq('reporter_id', req.user.id)
        .eq('status', 'pending')
        .single();
    if (existingReport) {
        throw new errors_1.ValidationError('You have already submitted a pending report for this website');
    }
    // Create report
    const { data: report, error } = await supabase_1.supabase
        .from('reports')
        .insert({
        website_id: websiteId,
        reporter_id: req.user.id,
        reason,
        description: description?.trim() || null,
        status: 'pending',
    })
        .select(`
      *,
      website:websites(id, name, slug)
    `)
        .single();
    if (error)
        throw error;
    res.status(201).json({
        success: true,
        data: { report },
        message: 'Report submitted successfully. Our team will review it shortly.',
        timestamp: new Date().toISOString(),
    });
});
/**
 * @desc    Get current user's reports
 * @route   GET /api/v1/reports/my-reports
 * @access  Private (Authenticated users)
 */
exports.getMyReports = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.ForbiddenError('Authentication required');
    }
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const { data: reports, error, count } = await supabase_1.supabase
        .from('reports')
        .select(`
      *,
      website:websites(id, name, slug, thumbnail)
    `, { count: 'exact' })
        .eq('reporter_id', req.user.id)
        .order('created_at', { ascending: false })
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
 * @desc    Get a specific report by ID
 * @route   GET /api/v1/reports/:id
 * @access  Private (Owner or Admin)
 */
exports.getReportById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.ForbiddenError('Authentication required');
    }
    const { id } = req.params;
    const { data: report, error } = await supabase_1.supabase
        .from('reports')
        .select(`
      *,
      website:websites(id, name, slug, thumbnail),
      reporter:users!reports_reporter_id_fkey(id, name, username)
    `)
        .eq('id', id)
        .single();
    if (error || !report) {
        throw new errors_1.NotFoundError('Report not found');
    }
    // Check access - only reporter or admin can view
    if (report.reporter_id !== req.user.id && req.user.role !== 'admin') {
        throw new errors_1.ForbiddenError('You can only view your own reports');
    }
    res.status(200).json({
        success: true,
        data: { report },
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=report.controller.js.map