// ============================================
// Website API Hooks - Finding Gems Frontend
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { normalizeKeys } from './normalize';
import type { Website, FAQ } from '@/lib/types';

// Re-export the Website type from lib/types for consistency
export type { Website, FAQ };

export interface CreateWebsiteData {
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  thumbnail?: string;
  externalUrl: string;
  techStack?: string[];
  useCases?: string[];
  hasFreeTrial?: boolean;
}

// Keys for caching
export const websiteKeys = {
  all: ['websites'] as const,
  lists: () => [...websiteKeys.all, 'list'] as const,
  list: (filters: object) => [...websiteKeys.lists(), filters] as const,
  details: () => [...websiteKeys.all, 'detail'] as const,
  detail: (id: string) => [...websiteKeys.details(), id] as const,
  myWebsites: () => [...websiteKeys.all, 'my'] as const,
};

// Map UI sort options to backend column names
const mapSortToColumn = (sortBy?: 'newest' | 'rating' | 'alphabetical' | 'popular'): { sortBy?: string; sortOrder?: string } => {
  switch (sortBy) {
    case 'newest':
      return { sortBy: 'created_at', sortOrder: 'desc' };
    case 'rating':
      return { sortBy: 'rating', sortOrder: 'desc' };
    case 'alphabetical':
      return { sortBy: 'name', sortOrder: 'asc' };
    case 'popular':
      return { sortBy: 'view_count', sortOrder: 'desc' };
    default:
      return {};
  }
};

// Get all websites with filters, sorting, and pagination
export const useWebsites = (filters?: {
  categoryId?: string;
  category?: string; // Category slug for filtering
  search?: string;
  status?: string;
  hasFreeTrial?: boolean;
  sortBy?: 'newest' | 'rating' | 'alphabetical' | 'popular';
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: websiteKeys.list(filters || {}),
    queryFn: async () => {
      // Build API params, mapping sortBy to column names
      const { sortBy, ...restFilters } = filters || {};
      const sortParams = mapSortToColumn(sortBy);
      
      const response = await api.get<{ success: boolean; data: { websites: unknown[]; pagination?: { total: number; page: number; limit: number } } }>(
        '/websites',
        { ...restFilters, ...sortParams }
      );
      // Normalize snake_case API response to camelCase
      return response.data.websites.map(w => normalizeKeys<Website>(w));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get website by ID
export const useWebsite = (id: string) => {
  return useQuery({
    queryKey: websiteKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: { website: unknown } }>(
        `/websites/${id}`
      );
      // Normalize snake_case API response to camelCase
      return normalizeKeys<Website>(response.data.website);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get my websites (for creators)
export const useMyWebsites = () => {
  return useQuery({
    queryKey: websiteKeys.myWebsites(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: { websites: unknown[] } }>(
        '/websites/my-websites'
      );
      // Normalize snake_case API response to camelCase
      return response.data.websites.map(w => normalizeKeys<Website>(w));
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create website
export const useCreateWebsite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWebsiteData) => {
      const response = await api.post<{ success: boolean; data: { website: Website } }>(
        '/websites',
        data
      );
      return response.data.website;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: websiteKeys.myWebsites() });
    },
  });
};

// Update website
export const useUpdateWebsite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateWebsiteData> }) => {
      const response = await api.patch<{ success: boolean; data: { website: Website } }>(
        `/websites/${id}`,
        data
      );
      return response.data.website;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific website and lists
      queryClient.invalidateQueries({ queryKey: websiteKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: websiteKeys.myWebsites() });
    },
  });
};

// Delete website
export const useDeleteWebsite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/websites/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: websiteKeys.myWebsites() });
    },
  });
};
