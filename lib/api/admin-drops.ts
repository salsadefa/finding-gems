// Admin Drops API - Finding Gems Frontend

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiClient } from './client';
import type { Drop } from './drops';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  timestamp: string;
};

export const adminDropKeys = {
  all: ['admin', 'drops'] as const,
  list: (params: Record<string, unknown>) => [...adminDropKeys.all, 'list', params] as const,
  detail: (id: string) => [...adminDropKeys.all, 'detail', id] as const,
};

export const useAdminDrops = (params?: { page?: number; limit?: number; status?: 'draft' | 'published' }) => {
  const { page = 1, limit = 20, status } = params || {};
  return useQuery({
    queryKey: adminDropKeys.list({ page, limit, status }),
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<{
          drops: Drop[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
          };
        }>
      >('/admin/drops', { page, limit, status });
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

export const useAdminDrop = (id: string) => {
  return useQuery({
    queryKey: adminDropKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ drop: Drop; items: Array<{ id: string; position: number; note?: string | null; websiteId: string; websiteSlug?: string | null; websiteName?: string | null }> }>>(
        `/admin/drops/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateAdminDrop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; description?: string; coverImage?: string }) => {
      const response = await api.post<ApiResponse<{ drop: Drop }>>('/admin/drops', payload);
      return response.data.drop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminDropKeys.all });
    },
  });
};

export const useUpdateAdminDrop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; title?: string; description?: string; coverImage?: string; slug?: string }) => {
      const { id, ...rest } = payload;
      const response = await apiClient.patch<ApiResponse<{ drop: Drop }>>(`/admin/drops/${id}`, rest);
      return response.data.data.drop;
    },
    onSuccess: (_drop, variables) => {
      queryClient.invalidateQueries({ queryKey: adminDropKeys.all });
      queryClient.invalidateQueries({ queryKey: adminDropKeys.detail(variables.id) });
    },
  });
};

export const usePublishAdminDrop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<ApiResponse<{ drop: Drop }>>(`/admin/drops/${id}/publish`, {});
      return response.data.drop;
    },
    onSuccess: (_drop, id) => {
      queryClient.invalidateQueries({ queryKey: adminDropKeys.all });
      queryClient.invalidateQueries({ queryKey: adminDropKeys.detail(id) });
    },
  });
};

export const useSetAdminDropItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; items: Array<{ websiteSlug: string; note?: string }> }) => {
      const response = await apiClient.put<ApiResponse<{ items: Array<{ id: string; position: number; note?: string | null; websiteId: string }> }>>(
        `/admin/drops/${payload.id}/items`,
        { items: payload.items }
      );
      return response.data.data.items;
    },
    onSuccess: (_items, payload) => {
      queryClient.invalidateQueries({ queryKey: adminDropKeys.detail(payload.id) });
      queryClient.invalidateQueries({ queryKey: adminDropKeys.all });
    },
  });
};
