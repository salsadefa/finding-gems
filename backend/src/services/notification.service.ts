// ============================================
// Notification Service - Finding Gems Backend
// ============================================

import { NotificationType } from '@prisma/client';
import { supabase } from '../config/supabase';
import { randomUUID } from 'crypto';

// ============================================
// TYPES
// ============================================

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a new admin notification
 */
export async function createNotification(params: CreateNotificationParams) {
  const sb: any = supabase as any;
  if (!sb || typeof sb.from !== 'function') {
    throw new Error('Supabase client not initialized');
  }

  const now = new Date().toISOString();
  const row = {
    id: randomUUID(),
    type: params.type,
    title: params.title,
    message: params.message,
    entityType: params.entityType ?? null,
    entityId: params.entityId ?? null,
    metadata: params.metadata ?? null,
    isRead: false,
    readAt: null,
    createdAt: now,
  };

  const { data, error } = await supabase
    .from('admin_notifications')
    .insert(row)
    .select('id, type, title, message, isRead, readAt, entityType, entityId, metadata, createdAt')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create notification for new creator application
 */
export async function notifyNewCreatorApplication(
  applicationId: string,
  applicantName: string,
  applicantEmail: string
) {
  return createNotification({
    type: 'creator_application',
    title: 'New Creator Application',
    message: `${applicantName} (${applicantEmail}) has submitted a creator application.`,
    entityType: 'application',
    entityId: applicationId,
    metadata: {
      applicantName,
      applicantEmail,
    },
  });
}

/**
 * Create notification for new order/purchase
 */
export async function notifyNewOrder(
  orderId: string,
  orderNumber: string,
  amount: number,
  buyerName: string,
  websiteName: string
) {
  return createNotification({
    type: 'new_order',
    title: 'New Purchase',
    message: `${buyerName} purchased "${websiteName}" for Rp ${amount.toLocaleString('id-ID')}.`,
    entityType: 'order',
    entityId: orderId,
    metadata: {
      orderNumber,
      amount,
      buyerName,
      websiteName,
    },
  });
}

/**
 * Create notification for new report/moderation
 */
export async function notifyNewReport(
  reportId: string,
  reporterName: string,
  websiteName: string,
  reason: string
) {
  return createNotification({
    type: 'new_report',
    title: 'New Moderation Report',
    message: `${reporterName} reported "${websiteName}" for: ${reason}.`,
    entityType: 'report',
    entityId: reportId,
    metadata: {
      reporterName,
      websiteName,
      reason,
    },
  });
}

/**
 * Create notification for refund request
 */
export async function notifyRefundRequest(
  refundId: string,
  orderNumber: string,
  amount: number,
  buyerName: string,
  reason: string
) {
  return createNotification({
    type: 'refund_request',
    title: 'New Refund Request',
    message: `${buyerName} requested a refund of Rp ${amount.toLocaleString('id-ID')} for order #${orderNumber}.`,
    entityType: 'refund',
    entityId: refundId,
    metadata: {
      orderNumber,
      amount,
      buyerName,
      reason,
    },
  });
}

/**
 * Create system alert notification
 */
export async function notifySystemAlert(
  title: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  return createNotification({
    type: 'system_alert',
    title,
    message,
    metadata,
  });
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Get notifications with pagination
 */
export async function getNotifications(params: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  const sb: any = supabase as any;
  if (!sb || typeof sb.from !== 'function') {
    throw new Error('Supabase client not initialized');
  }

  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  let q = supabase
    .from('admin_notifications')
    .select('id, type, title, message, isRead, readAt, entityType, entityId, metadata, createdAt', { count: 'exact' });

  if (params.unreadOnly) {
    q = q.eq('isRead', false);
  }

  const [{ data: notifications, error: listError, count }, { count: unreadCount, error: unreadError }] = await Promise.all([
    q.order('createdAt', { ascending: false }).range(skip, skip + limit - 1),
    supabase.from('admin_notifications').select('*', { count: 'exact', head: true }).eq('isRead', false),
  ]);

  if (listError) throw listError;
  if (unreadError) throw unreadError;

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  const sb: any = supabase as any;
  if (!sb || typeof sb.from !== 'function') {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('admin_notifications')
    .update({ isRead: true, readAt: new Date().toISOString() })
    .eq('id', notificationId)
    .select('id, type, title, message, isRead, readAt, entityType, entityId, metadata, createdAt')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  const sb: any = supabase as any;
  if (!sb || typeof sb.from !== 'function') {
    throw new Error('Supabase client not initialized');
  }

  const { count: unreadCount, error: unreadError } = await supabase
    .from('admin_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('isRead', false);
  if (unreadError) throw unreadError;

  if (!unreadCount) return { count: 0 };

  const { error } = await supabase
    .from('admin_notifications')
    .update({ isRead: true, readAt: new Date().toISOString() })
    .eq('isRead', false);
  if (error) throw error;

  return { count: unreadCount };
}

/**
 * Delete old notifications (cleanup - older than 30 days)
 */
export async function cleanupOldNotifications(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const sb: any = supabase as any;
  if (!sb || typeof sb.from !== 'function') {
    throw new Error('Supabase client not initialized');
  }

  const cutoff = cutoffDate.toISOString();

  const { count: toDelete, error: countError } = await supabase
    .from('admin_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('isRead', true)
    .lt('createdAt', cutoff);
  if (countError) throw countError;

  if (!toDelete) return { count: 0 };

  const { error: delError } = await supabase
    .from('admin_notifications')
    .delete()
    .eq('isRead', true)
    .lt('createdAt', cutoff);
  if (delError) throw delError;

  return { count: toDelete };
}
