"use strict";
// ============================================
// Refund Controller - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRefund = exports.getAllRefunds = exports.cancelRefund = exports.getRefundDetail = exports.getRefunds = exports.requestRefund = void 0;
const supabase_1 = require("../config/supabase");
const catchAsync_1 = require("../utils/catchAsync");
const email_service_1 = require("../services/email.service");
// ============================================
// BUYER/CREATOR REFUND REQUESTS
// ============================================
/**
 * Request a refund
 * POST /api/v1/refunds
 */
exports.requestRefund = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { order_id, reason, reason_category, evidence_urls } = req.body;
    if (!order_id || !reason) {
        return res.status(400).json({
            success: false,
            error: { message: 'order_id and reason are required' }
        });
    }
    // Get order and verify ownership
    const { data: order, error: orderError } = await supabase_1.supabase
        .from('orders')
        .select('*, transactions(*)')
        .eq('id', order_id)
        .single();
    if (orderError || !order) {
        return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    }
    // Verify user is buyer or creator of the order
    const isBuyer = order.buyer_id === user.id;
    const isCreator = order.creator_id === user.id;
    if (!isBuyer && !isCreator) {
        return res.status(403).json({
            success: false,
            error: { message: 'You can only request refunds for your own orders' }
        });
    }
    // Check order status
    if (order.status !== 'paid') {
        return res.status(400).json({
            success: false,
            error: { message: 'Only paid orders can be refunded' }
        });
    }
    // Check if refund already exists
    if (order.refund_status !== 'none') {
        return res.status(400).json({
            success: false,
            error: { message: 'A refund request already exists for this order' }
        });
    }
    // Generate refund number
    const { data: refundNumResult } = await supabase_1.supabase.rpc('generate_refund_number');
    const refundNumber = refundNumResult || `RF${Date.now()}`;
    // Get transaction for reference
    const transaction = order.transactions?.[0];
    // Create refund request
    const { data: refund, error } = await supabase_1.supabase
        .from('refunds')
        .insert({
        refund_number: refundNumber,
        order_id: order.id,
        transaction_id: transaction?.id,
        requested_by: user.id,
        requester_type: isBuyer ? 'buyer' : 'creator',
        original_amount: order.total_amount,
        refund_amount: order.total_amount, // Full refund by default
        reason,
        reason_category: reason_category || 'other',
        evidence_urls: evidence_urls || [],
        status: 'requested'
    })
        .select()
        .single();
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    // Update order refund status
    await supabase_1.supabase
        .from('orders')
        .update({ refund_status: 'requested', updated_at: new Date().toISOString() })
        .eq('id', order_id);
    res.status(201).json({
        success: true,
        data: { refund },
        message: 'Refund request submitted. Our team will review it within 1-3 business days.',
        timestamp: new Date().toISOString()
    });
});
/**
 * Get user's refund requests
 * GET /api/v1/refunds
 */
exports.getRefunds = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = supabase_1.supabase
        .from('refunds')
        .select(`
      *,
      order:orders(id, order_number, total_amount, status)
    `, { count: 'exact' })
        .eq('requested_by', user.id)
        .order('createdAt', { ascending: false })
        .range(offset, offset + Number(limit) - 1);
    if (status) {
        query = query.eq('status', status);
    }
    const { data: refunds, count, error } = await query;
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    res.status(200).json({
        success: true,
        data: {
            refunds: refunds || [],
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count || 0,
                total_pages: Math.ceil((count || 0) / Number(limit))
            }
        },
        timestamp: new Date().toISOString()
    });
});
/**
 * Get refund detail
 * GET /api/v1/refunds/:id
 */
exports.getRefundDetail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { id } = req.params;
    const { data: refund, error } = await supabase_1.supabase
        .from('refunds')
        .select(`
      *,
      order:orders(*, buyer:users!orders_buyer_id_fkey(id, name, email))
    `)
        .eq('id', id)
        .single();
    if (error || !refund) {
        return res.status(404).json({ success: false, error: { message: 'Refund not found' } });
    }
    // Verify access
    const order = refund.order;
    if (refund.requested_by !== user.id && order?.buyer_id !== user.id && order?.creator_id !== user.id && user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }
    res.status(200).json({
        success: true,
        data: { refund },
        timestamp: new Date().toISOString()
    });
});
/**
 * Cancel refund request
 * POST /api/v1/refunds/:id/cancel
 */
exports.cancelRefund = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const { id } = req.params;
    const { data: refund } = await supabase_1.supabase
        .from('refunds')
        .select('*')
        .eq('id', id)
        .eq('requested_by', user.id)
        .single();
    if (!refund) {
        return res.status(404).json({ success: false, error: { message: 'Refund not found' } });
    }
    if (!['requested', 'under_review'].includes(refund.status)) {
        return res.status(400).json({
            success: false,
            error: { message: `Cannot cancel refund with status: ${refund.status}` }
        });
    }
    const { error } = await supabase_1.supabase
        .from('refunds')
        .update({
        status: 'cancelled',
        status_message: 'Cancelled by requester',
        updated_at: new Date().toISOString()
    })
        .eq('id', id);
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    // Update order refund status
    await supabase_1.supabase
        .from('orders')
        .update({ refund_status: 'none', updated_at: new Date().toISOString() })
        .eq('id', refund.order_id);
    res.status(200).json({
        success: true,
        message: 'Refund request cancelled',
        timestamp: new Date().toISOString()
    });
});
// ============================================
// ADMIN REFUND MANAGEMENT
// ============================================
/**
 * Get all refunds (Admin)
 * GET /api/v1/refunds/admin/all
 */
exports.getAllRefunds = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let query = supabase_1.supabase
        .from('refunds')
        .select(`
      *,
      order:orders(id, order_number, total_amount),
      requester:users!refunds_requested_by_fkey(id, name, email)
    `, { count: 'exact' })
        .order('createdAt', { ascending: false })
        .range(offset, offset + Number(limit) - 1);
    if (status) {
        query = query.eq('status', status);
    }
    const { data: refunds, count, error } = await query;
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    res.status(200).json({
        success: true,
        data: {
            refunds: refunds || [],
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count || 0,
                total_pages: Math.ceil((count || 0) / Number(limit))
            }
        },
        timestamp: new Date().toISOString()
    });
});
/**
 * Process refund (Admin)
 * POST /api/v1/refunds/admin/:id/process
 */
exports.processRefund = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    }
    const { id } = req.params;
    const { action, refund_amount, refund_method, refund_details, status_message, admin_notes } = req.body;
    if (!['approve', 'reject', 'complete'].includes(action)) {
        return res.status(400).json({
            success: false,
            error: { message: 'Action must be approve, reject, or complete' }
        });
    }
    const { data: refund } = await supabase_1.supabase
        .from('refunds')
        .select('*, order:orders(*)')
        .eq('id', id)
        .single();
    if (!refund) {
        return res.status(404).json({ success: false, error: { message: 'Refund not found' } });
    }
    let newStatus;
    let updateData = {
        updated_at: new Date().toISOString()
    };
    switch (action) {
        case 'approve':
            if (!['requested', 'under_review'].includes(refund.status)) {
                return res.status(400).json({
                    success: false,
                    error: { message: `Cannot approve refund with status: ${refund.status}` }
                });
            }
            newStatus = 'approved';
            updateData = {
                ...updateData,
                status: newStatus,
                status_message: status_message || 'Refund approved',
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                refund_amount: refund_amount || refund.refund_amount,
                refund_method: refund_method || 'original_payment',
                refund_details,
                admin_notes
            };
            break;
        case 'reject':
            if (!['requested', 'under_review'].includes(refund.status)) {
                return res.status(400).json({
                    success: false,
                    error: { message: `Cannot reject refund with status: ${refund.status}` }
                });
            }
            newStatus = 'rejected';
            updateData = {
                ...updateData,
                status: newStatus,
                status_message: status_message || 'Refund rejected',
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
                admin_notes
            };
            // Update order
            await supabase_1.supabase
                .from('orders')
                .update({ refund_status: 'none', updated_at: new Date().toISOString() })
                .eq('id', refund.order_id);
            break;
        case 'complete':
            if (refund.status !== 'approved') {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Refund must be approved before completing' }
                });
            }
            newStatus = 'completed';
            updateData = {
                ...updateData,
                status: newStatus,
                status_message: status_message || 'Refund completed',
                processed_by: user.id,
                processed_at: new Date().toISOString(),
                admin_notes
            };
            const order = refund.order;
            const isFullRefund = Number(refund.refund_amount) >= Number(order.total_amount);
            // Update order
            await supabase_1.supabase
                .from('orders')
                .update({
                refund_status: isFullRefund ? 'full' : 'partial',
                refunded_amount: Number(order.refunded_amount || 0) + Number(refund.refund_amount),
                status: isFullRefund ? 'refunded' : order.status,
                updated_at: new Date().toISOString()
            })
                .eq('id', refund.order_id);
            // Revoke user access if full refund
            if (isFullRefund) {
                await supabase_1.supabase
                    .from('user_access')
                    .update({
                    status: 'revoked',
                    revoked_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                    .eq('order_id', refund.order_id);
            }
            break;
        default:
            return res.status(400).json({ success: false, error: { message: 'Invalid action' } });
    }
    const { error } = await supabase_1.supabase
        .from('refunds')
        .update(updateData)
        .eq('id', id);
    if (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
    // Send email notification to requester
    const { data: requester } = await supabase_1.supabase
        .from('users')
        .select('email, name')
        .eq('id', refund.requested_by)
        .single();
    if (requester?.email && ['approved', 'rejected', 'completed'].includes(newStatus)) {
        const order = refund.order;
        (0, email_service_1.sendRefundStatusEmail)(requester.email, {
            userName: requester.name || 'Customer',
            refundNumber: refund.refund_number,
            orderNumber: order?.order_number || 'N/A',
            amount: Number(refund.refund_amount),
            status: newStatus,
            message: status_message
        }).catch((err) => console.error('Failed to send refund status email:', err));
    }
    res.status(200).json({
        success: true,
        message: `Refund ${action}d successfully`,
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=refund.controller.js.map