// ============================================
// Review API Hooks - Finding Gems Frontend
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { normalizeKeys } from './normalize';
import type { Review } from '@/lib/types';

export type { Review };

export interface CreateReviewData {
  websiteId: string;
  rating: number;
  title: string;
  content: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
}

// Keys for caching
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters: object) => [...reviewKeys.lists(), filters] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  byWebsite: (websiteId: string) => [...reviewKeys.all, 'website', websiteId] as const,
  myReviews: () => [...reviewKeys.all, 'my'] as const,
};

// Get reviews with filters and pagination
export const useReviews = (filters?: {
  websiteId?: string;
  userId?: string;
  minRating?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: reviewKeys.list(filters || {}),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: {
          reviews: unknown[];
          pagination?: { total: number; page: number; limit: number; totalPages: number };
        };
      }>('/reviews', filters);
      // Normalize snake_case API response to camelCase
      return {
        ...response.data,
        reviews: response.data.reviews.map(r => normalizeKeys<Review>(r)),
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get reviews by website ID
export const useWebsiteReviews = (websiteId: string, options?: {
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  limit?: number;
}) => {
  return useQuery({
    queryKey: reviewKeys.byWebsite(websiteId),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: {
          reviews: unknown[];
          pagination?: { total: number; page: number; limit: number; totalPages: number };
        };
      }>('/reviews', {
        websiteId,
        sortBy: options?.sortBy || 'newest',
        limit: options?.limit || 10,
      });
      // Normalize snake_case API response to camelCase
      return response.data.reviews.map(r => normalizeKeys<Review>(r));
    },
    enabled: !!websiteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get single review by ID
export const useReview = (id: string) => {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: { review: unknown } }>(
        `/reviews/${id}`
      );
      // Normalize snake_case API response to camelCase
      return normalizeKeys<Review>(response.data.review);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create review
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const response = await api.post<{ success: boolean; data: { review: Review } }>(
        '/reviews',
        data
      );
      return response.data.review;
    },
    onSuccess: (_, variables) => {
      // Invalidate reviews list for the website
      queryClient.invalidateQueries({ queryKey: reviewKeys.byWebsite(variables.websiteId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
};

// Update review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReviewData }) => {
      const response = await api.patch<{ success: boolean; data: { review: Review } }>(
        `/reviews/${id}`,
        data
      );
      return response.data.review;
    },
    onSuccess: (data) => {
      // Invalidate specific review and lists
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.byWebsite(data.websiteId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews() });
    },
  });
};

// Delete review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, websiteId }: { id: string; websiteId: string }) => {
      await api.delete(`/reviews/${id}`);
      return { id, websiteId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byWebsite(variables.websiteId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews() });
    },
  });
};

// Mark review as helpful
export const useMarkReviewHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<{ success: boolean; data: { review: Review } }>(
        `/reviews/${id}/helpful`,
        {}
      );
      return response.data.review;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.byWebsite(data.websiteId) });
    },
  });
};
