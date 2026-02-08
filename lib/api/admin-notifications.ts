// ============================================
// Admin Notification API - Finding Gems Frontend
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

// ============================================
// TYPES
// ============================================

export type NotificationType = 
  | 'creator_application'
  | 'new_order'
  | 'new_report'
  | 'refund_request'
  | 'system_alert';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: AdminNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// HOOKS
// ============================================

/**
 * Get admin notifications with pagination
 */
export const useAdminNotifications = (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) => {
  const { page = 1, limit = 20, unreadOnly = false } = params || {};

  return useQuery<NotificationResponse>({
    queryKey: ['admin', 'notifications', { page, limit, unreadOnly }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(unreadOnly && { unread_only: 'true' }),
      });
      const { data } = await apiClient.get(`/admin/notifications?${searchParams}`);
      return data.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

/**
 * Get unread notification count (for badge)
 */
export const useUnreadNotificationCount = () => {
  return useQuery<number>({
    queryKey: ['admin', 'notifications', 'count'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/notifications/count');
      return data.data.unreadCount;
    },
    refetchInterval: 15000, // Poll every 15 seconds for badge
  });
};

/**
 * Mark notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await apiClient.patch(`/admin/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/admin/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
};

/**
 * Get notification icon based on type
 */
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'creator_application':
      return '👤'; // User icon
    case 'new_order':
      return '💰'; // Money icon
    case 'new_report':
      return '⚠️'; // Warning icon
    case 'refund_request':
      return '↩️'; // Return icon
    case 'system_alert':
      return '🔔'; // Bell icon
    default:
      return '📌'; // Pin icon
  }
};

/**
 * Get notification color class based on type
 */
export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'creator_application':
      return 'bg-blue-500';
    case 'new_order':
      return 'bg-green-500';
    case 'new_report':
      return 'bg-orange-500';
    case 'refund_request':
      return 'bg-red-500';
    case 'system_alert':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Get link to entity based on notification type
 */
export const getNotificationLink = (notification: AdminNotification): string | null => {
  if (!notification.entityId) return null;

  switch (notification.entityType) {
    case 'application':
      return `/admin?tab=creators`;
    case 'order':
      return `/admin?tab=finance`;
    case 'report':
      return `/admin?tab=reports`;
    case 'refund':
      return `/admin?tab=finance`;
    default:
      return null;
  }
};
