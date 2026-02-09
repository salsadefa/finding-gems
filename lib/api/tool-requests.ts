// Tool Requests API Hooks - Finding Gems Frontend

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export type ToolRequestStatus = 'open' | 'closed';

export interface ToolRequestListItem {
  id: string;
  title: string;
  description: string;
  status: ToolRequestStatus;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  responseCount: number;
  lastResponseAt: string | null;
  selectedResponseId?: string | null;
  solvedAt?: string | null;
  solvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug: string; icon?: string } | null;
  buyer?: { id: string; name: string; username: string; avatar?: string } | null;
}

export interface ToolRequestResponse {
  id: string;
  message: string;
  createdAt: string;
  responder: { id: string; name: string; username: string; avatar?: string; role: string };
  website?: { id: string; name: string; slug: string; thumbnail?: string } | null;
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  timestamp?: string;
};

export const toolRequestKeys = {
  all: ['tool-requests'] as const,
  list: (params: Record<string, unknown>) => [...toolRequestKeys.all, 'list', params] as const,
  detail: (id: string) => [...toolRequestKeys.all, 'detail', id] as const,
};

export const useToolRequests = (params?: {
  page?: number;
  limit?: number;
  status?: ToolRequestStatus;
  search?: string;
  category?: string;
  sortBy?: 'newest' | 'recent_activity';
}) => {
  const p = params || {};
  return useQuery({
    queryKey: toolRequestKeys.list(p),
    queryFn: async () => {
      const response = await apiClient.get<
        ApiEnvelope<{
          requests: ToolRequestListItem[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
          };
        }>
      >('/requests', { params: p });
      return response.data.data;
    },
    staleTime: 30 * 1000,
  });
};

export const useToolRequest = (id: string) => {
  return useQuery({
    queryKey: toolRequestKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<
        ApiEnvelope<{ request: ToolRequestListItem; responses: ToolRequestResponse[] }>
      >(`/requests/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateToolRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string;
      categoryId?: string;
      budgetMin?: number;
      budgetMax?: number;
      currency?: string;
    }) => {
      const response = await apiClient.post<ApiEnvelope<{ request: ToolRequestListItem }>>('/requests', payload);
      return response.data.data.request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toolRequestKeys.all });
    },
  });
};

export const useCloseToolRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<ApiEnvelope<{ request: ToolRequestListItem }>>(`/requests/${id}/close`, {});
      return response.data.data.request;
    },
    onSuccess: (_request, id) => {
      queryClient.invalidateQueries({ queryKey: toolRequestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: toolRequestKeys.all });
    },
  });
};

export const useCreateToolRequestResponse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { requestId: string; message: string; websiteSlug?: string }) => {
      const response = await apiClient.post<ApiEnvelope<{ response: ToolRequestResponse }>>(
        `/requests/${payload.requestId}/responses`,
        {
          message: payload.message,
          ...(payload.websiteSlug ? { websiteSlug: payload.websiteSlug } : {}),
        }
      );
      return response.data.data.response;
    },
    onSuccess: (_resp, payload) => {
      queryClient.invalidateQueries({ queryKey: toolRequestKeys.detail(payload.requestId) });
      queryClient.invalidateQueries({ queryKey: toolRequestKeys.all });
    },
  });
};

export const useSolveToolRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { requestId: string; responseId?: string }) => {
      const resp = await apiClient.patch<ApiEnvelope<{ request: ToolRequestListItem }>>(
        `/requests/${payload.requestId}/solve`,
        { ...(payload.responseId ? { responseId: payload.responseId } : {}) }
      );
      return resp.data.data.request;
    },
    onSuccess: (_req, payload) => {
      queryClient.invalidateQueries({ queryKey: toolRequestKeys.detail(payload.requestId) });
      queryClient.invalidateQueries({ queryKey: toolRequestKeys.all });
    },
  });
};
