import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

// Types
export interface CreatorApplication {
  id: string;
  userId: string;
  bio: string;
  professionalBackground?: string;
  expertise: string[];
  portfolioUrl?: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface CreateApplicationData {
  bio: string;
  professionalBackground?: string;
  expertise?: string[];
  portfolioUrl?: string;
  motivation: string;
}

// Query keys
export const creatorApplicationKeys = {
  all: ['creator-applications'] as const,
  my: () => [...creatorApplicationKeys.all, 'my'] as const,
  list: () => [...creatorApplicationKeys.all, 'list'] as const,
  detail: (id: string) => [...creatorApplicationKeys.all, id] as const,
};

// Hooks

/**
 * Get current user's creator application
 */
export const useMyCreatorApplication = () => {
  return useQuery({
    queryKey: creatorApplicationKeys.my(),
    queryFn: async () => {
      const response = await apiClient.get<CreatorApplication>('/creator-applications/me');
      return response.data;
    },
    retry: false,
    // Don't throw error if no application exists (404)
    throwOnError: false,
  });
};

/**
 * Submit a creator application
 */
export const useCreatorApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApplicationData) => {
      const response = await apiClient.post<CreatorApplication>('/creator-applications', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(creatorApplicationKeys.my(), data);
      queryClient.invalidateQueries({ queryKey: creatorApplicationKeys.all });
    },
  });
};

/**
 * Get all creator applications (admin only)
 */
export const useCreatorApplications = (status?: 'pending' | 'approved' | 'rejected') => {
  return useQuery({
    queryKey: [...creatorApplicationKeys.list(), status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const response = await apiClient.get<{ data: CreatorApplication[]; total: number }>(
        `/creator-applications?${params.toString()}`
      );
      return response.data;
    },
  });
};

/**
 * Approve a creator application (admin only)
 */
export const useApproveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await apiClient.post<CreatorApplication>(
        `/creator-applications/${applicationId}/approve`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorApplicationKeys.all });
    },
  });
};

/**
 * Reject a creator application (admin only)
 */
export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: string; reason?: string }) => {
      const response = await apiClient.post<CreatorApplication>(
        `/creator-applications/${applicationId}/reject`,
        { reason }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorApplicationKeys.all });
    },
  });
};
