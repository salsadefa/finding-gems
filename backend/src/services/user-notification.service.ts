// ============================================
// User Notification Service - Finding Gems Backend
// ============================================

import { supabase } from '../config/supabase';

export type UserNotificationType =
  | 'request_response'
  | 'request_solved'
  | 'system';

export async function createUserNotification(params: {
  recipientId: string;
  type: UserNotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const now = new Date().toISOString();

  const row = {
    recipientId: params.recipientId,
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
    .from('user_notifications')
    .insert(row)
    .select('id, type, title, message, entityType, entityId, metadata, isRead, readAt, createdAt')
    .single();

  if (error) throw error;
  return data;
}

export async function getUserNotifications(params: {
  recipientId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  let q = supabase
    .from('user_notifications')
    .select('id, type, title, message, entityType, entityId, metadata, isRead, readAt, createdAt', {
      count: 'exact',
    })
    .eq('recipientId', params.recipientId);

  if (params.unreadOnly) q = q.eq('isRead', false);

  const [{ data: notifications, error: listError, count }, { count: unreadCount, error: unreadError }] = await Promise.all([
    q.order('createdAt', { ascending: false }).range(skip, skip + limit - 1),
    supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipientId', params.recipientId)
      .eq('isRead', false),
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

export async function markUserNotificationAsRead(params: { recipientId: string; id: string }) {
  const { data, error } = await supabase
    .from('user_notifications')
    .update({ isRead: true, readAt: new Date().toISOString() })
    .eq('id', params.id)
    .eq('recipientId', params.recipientId)
    .select('id, type, title, message, entityType, entityId, metadata, isRead, readAt, createdAt')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function markAllUserNotificationsAsRead(params: { recipientId: string }) {
  const { count, error: countError } = await supabase
    .from('user_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipientId', params.recipientId)
    .eq('isRead', false);

  if (countError) throw countError;
  if (!count) return { count: 0 };

  const { error } = await supabase
    .from('user_notifications')
    .update({ isRead: true, readAt: new Date().toISOString() })
    .eq('recipientId', params.recipientId)
    .eq('isRead', false);

  if (error) throw error;
  return { count };
}
