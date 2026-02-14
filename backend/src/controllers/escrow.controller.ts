// ============================================
// Escrow Controller - Finding Gems Backend
// Phase 1 MVP: internal holding state on orders
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';

type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed';

function getOrderTimestamp(order: any): Date {
  const raw = order.paid_at || order.created_at;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date(order.created_at) : d;
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

async function recalcCreatorBalance(creatorId: string) {
  // Function exists in DB migrations (002 + updated in 008)
  await supabase.rpc('recalculate_creator_balance', { p_creator_id: creatorId });
}

/**
 * Buyer confirms delivery and releases escrow
 * POST /api/v1/orders/:orderId/confirm-delivery
 */
export const confirmDelivery = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  if (user.role !== 'buyer') {
    return res.status(403).json({ success: false, error: { message: 'Buyer access required' } });
  }

  const { orderId } = req.params;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, buyer_id, creator_id, status, refund_status, escrow_status, paid_at, created_at')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return res.status(404).json({ success: false, error: { message: 'Order not found' } });
  }

  if (order.buyer_id !== user.id) {
    return res.status(403).json({ success: false, error: { message: 'Not authorized to confirm this order' } });
  }

  if (order.status !== 'paid') {
    return res.status(400).json({ success: false, error: { message: 'Only paid orders can be confirmed' } });
  }

  const escrowStatus = (order.escrow_status as EscrowStatus | null) || 'released';
  if (escrowStatus === 'released') {
    return res.status(200).json({ success: true, data: { order }, message: 'Escrow already released', timestamp: new Date().toISOString() });
  }
  if (escrowStatus !== 'held') {
    return res.status(400).json({
      success: false,
      error: { message: `Cannot confirm delivery when escrow_status is ${escrowStatus}` },
    });
  }
  if (order.refund_status && order.refund_status !== 'none') {
    return res.status(400).json({ success: false, error: { message: 'Cannot release escrow while refund is in progress' } });
  }

  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({
      escrow_status: 'released',
      escrow_released_at: new Date().toISOString(),
      escrow_release_reason: 'buyer_confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*')
    .single();

  if (updateError || !updated) {
    return res.status(500).json({ success: false, error: { message: 'Failed to release escrow', details: updateError?.message } });
  }

  await recalcCreatorBalance(order.creator_id);

  return res.status(200).json({
    success: true,
    data: { order: updated },
    message: 'Delivery confirmed. Escrow released.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Buyer requests refund for a held order (escrow -> disputed)
 * POST /api/v1/orders/:orderId/request-refund
 */
export const requestRefundForOrder = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  if (user.role !== 'buyer') {
    return res.status(403).json({ success: false, error: { message: 'Buyer access required' } });
  }

  const { orderId } = req.params;
  const { reason, reason_category, evidence_urls } = req.body as {
    reason?: string;
    reason_category?: string;
    evidence_urls?: string[];
  };

  if (!reason || typeof reason !== 'string') {
    return res.status(400).json({ success: false, error: { message: 'reason is required' } });
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, transactions(*)')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return res.status(404).json({ success: false, error: { message: 'Order not found' } });
  }
  if (order.buyer_id !== user.id) {
    return res.status(403).json({ success: false, error: { message: 'Not authorized to request refund for this order' } });
  }
  if (order.status !== 'paid') {
    return res.status(400).json({ success: false, error: { message: 'Only paid orders can be refunded' } });
  }

  const escrowStatus = (order.escrow_status as EscrowStatus | null) || 'released';
  if (escrowStatus !== 'held') {
    return res.status(400).json({ success: false, error: { message: 'Refund can only be requested while funds are held' } });
  }

  if (order.refund_status && order.refund_status !== 'none') {
    return res.status(400).json({ success: false, error: { message: 'A refund request already exists for this order' } });
  }

  const orderDate = getOrderTimestamp(order);
  const limitDays = 14;
  const ageDays = daysSince(orderDate);
  if (ageDays > limitDays) {
    return res.status(400).json({
      success: false,
      error: { message: `Refund requests are only allowed within ${limitDays} days of payment. This order is ${ageDays} days old.` },
    });
  }

  const { data: refundNumResult } = await supabase.rpc('generate_refund_number');
  const refundNumber = refundNumResult || `RF${Date.now()}`;
  const transaction = order.transactions?.[0];

  const { data: refund, error: refundError } = await supabase
    .from('refunds')
    .insert({
      refund_number: refundNumber,
      order_id: order.id,
      transaction_id: transaction?.id,
      requested_by: user.id,
      requester_type: 'buyer',
      original_amount: order.total_amount,
      refund_amount: order.total_amount,
      reason,
      reason_category: reason_category || 'other',
      evidence_urls: evidence_urls || [],
      status: 'requested',
    })
    .select('*')
    .single();

  if (refundError || !refund) {
    return res.status(500).json({ success: false, error: { message: refundError?.message || 'Failed to create refund request' } });
  }

  await supabase
    .from('orders')
    .update({
      refund_status: 'requested',
      escrow_status: 'disputed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  return res.status(201).json({
    success: true,
    data: { refund },
    message: 'Refund request submitted. Our team will review it.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Admin: release escrow
 * POST /api/v1/admin/escrow/:orderId/release
 */
export const adminReleaseEscrow = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
  }

  const { orderId } = req.params;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, creator_id, status, refund_status, escrow_status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return res.status(404).json({ success: false, error: { message: 'Order not found' } });
  }

  if (order.status !== 'paid') {
    return res.status(400).json({ success: false, error: { message: 'Only paid orders can be released' } });
  }

  const escrowStatus = (order.escrow_status as EscrowStatus | null) || 'released';
  if (escrowStatus === 'released') {
    return res.status(200).json({ success: true, data: { order }, message: 'Escrow already released', timestamp: new Date().toISOString() });
  }
  if (escrowStatus === 'refunded') {
    return res.status(400).json({ success: false, error: { message: 'Order already refunded' } });
  }
  if (order.refund_status && order.refund_status !== 'none') {
    return res.status(400).json({ success: false, error: { message: 'Cannot release escrow while refund is in progress' } });
  }

  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({
      escrow_status: 'released',
      escrow_released_at: new Date().toISOString(),
      escrow_release_reason: 'admin_approved',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*')
    .single();

  if (updateError || !updated) {
    return res.status(500).json({ success: false, error: { message: 'Failed to release escrow', details: updateError?.message } });
  }

  await recalcCreatorBalance(order.creator_id);

  return res.status(200).json({
    success: true,
    data: { order: updated },
    message: 'Escrow released',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Admin: mark order as refunded in escrow and complete refund record
 * POST /api/v1/admin/escrow/:orderId/refund
 */
export const adminRefundEscrow = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Admin access required' } });
  }

  const { orderId } = req.params;
  const { admin_notes } = req.body as { admin_notes?: string };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, transactions(*)')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return res.status(404).json({ success: false, error: { message: 'Order not found' } });
  }

  const escrowStatus = (order.escrow_status as EscrowStatus | null) || 'released';
  if (escrowStatus === 'refunded' || order.status === 'refunded') {
    return res.status(200).json({ success: true, data: { order }, message: 'Order already refunded', timestamp: new Date().toISOString() });
  }

  // Ensure a refund record exists
  const { data: existingRefund } = await supabase
    .from('refunds')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let refund = existingRefund;

  if (!refund) {
    const { data: refundNumResult } = await supabase.rpc('generate_refund_number');
    const refundNumber = refundNumResult || `RF${Date.now()}`;
    const transaction = order.transactions?.[0];

    const { data: created, error: createError } = await supabase
      .from('refunds')
      .insert({
        refund_number: refundNumber,
        order_id: order.id,
        transaction_id: transaction?.id,
        requested_by: user.id,
        requester_type: 'admin',
        original_amount: order.total_amount,
        refund_amount: order.total_amount,
        reason: 'Admin refund',
        reason_category: 'other',
        evidence_urls: [],
        status: 'approved',
        status_message: 'Refund approved by admin',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes,
      })
      .select('*')
      .single();

    if (createError || !created) {
      return res.status(500).json({ success: false, error: { message: createError?.message || 'Failed to create refund record' } });
    }
    refund = created;
  }

  // Complete refund (internal state only)
  await supabase
    .from('refunds')
    .update({
      status: 'completed',
      status_message: 'Refund completed',
      processed_by: user.id,
      processed_at: new Date().toISOString(),
      admin_notes: admin_notes || refund.admin_notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', refund.id);

  // Update order + revoke access
  await supabase
    .from('orders')
    .update({
      status: 'refunded',
      refund_status: 'full',
      escrow_status: 'refunded',
      escrow_released_at: new Date().toISOString(),
      escrow_release_reason: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  await supabase
    .from('user_access')
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  await recalcCreatorBalance(order.creator_id);

  return res.status(200).json({
    success: true,
    data: { refund },
    message: 'Order refunded',
    timestamp: new Date().toISOString(),
  });
});
