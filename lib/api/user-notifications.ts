// User Notifications API Hooks - Finding Gems Frontend

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export type UserNotificationType = 'request_response' | 'request_solved' | 'system';

export interface UserNotification {
  id: string;
  type: UserNotificationType;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  timestamp?: string;
};

export const userNotificationKeys = {
  all: (userId: string | undefined) => ['user-notifications', userId || 'anon'] as const,
  list: (userId: string | undefined, params: Record<string, unknown>) => [...userNotificationKeys.all(userId), 'list', params] as const,
  count: (userId: string | undefined) => [...userNotificationKeys.all(userId), 'count'] as const,
};

export const useUserNotifications = (
  params?: { page?: number; limit?: number; unreadOnly?: boolean },
  userIdForKey?: string
) => {
  const p = params || {};
  return useQuery({
    queryKey: userNotificationKeys.list(userIdForKey, p),
    queryFn: async () => {
      const resp = await apiClient.get<
        ApiEnvelope<{
          notifications: UserNotification[];
          unreadCount: number;
          pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
        }>
      >('/notifications', {
        params: {
          page: p.page || 1,
          limit: p.limit || 20,
          ...(p.unreadOnly ? { unread_only: 'true' } : {}),
        },
      });
      return resp.data.data;
    },
    staleTime: 15 * 1000,
  });
};

export const useUserUnreadCount = (userIdForKey?: string) => {
  return useQuery({
    queryKey: userNotificationKeys.count(userIdForKey),
    queryFn: async () => {
      const resp = await apiClient.get<ApiEnvelope<{ unreadCount: number }>>('/notifications/count');
      return resp.data.data.unreadCount;
    },
    refetchInterval: 15_000,
  });
};

export const useMarkUserNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const resp = await apiClient.patch<ApiEnvelope<{ notification: UserNotification | null }>>(`/notifications/${id}/read`, {});
      return resp.data.data.notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });
};

export const useMarkAllUserNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const resp = await apiClient.post<ApiEnvelope<{ updatedCount: number }>>('/notifications/read-all', {});
      return resp.data.data.updatedCount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });
};
