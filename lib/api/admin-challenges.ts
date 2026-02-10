import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiClient } from './client';
import { normalizeKeys } from './normalize';
import type { Challenge, ChallengeSubmission } from '@/lib/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
};

export const adminChallengeKeys = {
  all: ['admin', 'challenges'] as const,
  list: (params: Record<string, unknown>) => [...adminChallengeKeys.all, 'list', params] as const,
  detail: (id: string) => [...adminChallengeKeys.all, 'detail', id] as const,
  submissions: (id: string, params: Record<string, unknown>) => [...adminChallengeKeys.all, 'submissions', id, params] as const,
};

export const useAdminChallenges = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  const p = params || {};
  return useQuery({
    queryKey: adminChallengeKeys.list(p),
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<{
          challenges: Challenge[];
          pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
        }>
      >('/admin/challenges', p);
      return {
        challenges: (response.data.challenges || []).map((c) => normalizeKeys<Challenge>(c as any)),
        pagination: response.data.pagination,
      };
    },
  });
};

export const useCreateAdminChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      slug: string;
      theme?: string;
      rules?: string;
      coverImage?: string;
      startAt: string;
      endAt: string;
      status?: 'upcoming' | 'active' | 'ended';
    }) => {
      const response = await api.post<ApiResponse<{ challenge: Challenge }>>('/admin/challenges', payload);
      return normalizeKeys<Challenge>(response.data.challenge as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminChallengeKeys.all }),
  });
};

export const useUpdateAdminChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string } & Partial<Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const { id, ...rest } = payload;
      const response = await apiClient.patch<ApiResponse<{ challenge: Challenge }>>(`/admin/challenges/${id}`, rest);
      return normalizeKeys<Challenge>(response.data.data.challenge as any);
    },
    onSuccess: (_ch, variables) => {
      queryClient.invalidateQueries({ queryKey: adminChallengeKeys.all });
      queryClient.invalidateQueries({ queryKey: adminChallengeKeys.detail(variables.id) });
    },
  });
};

export const useAdminChallengeSubmissions = (challengeId: string, params?: { status?: string }) => {
  const p = params || {};
  return useQuery({
    queryKey: adminChallengeKeys.submissions(challengeId, p),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ submissions: ChallengeSubmission[] }>>(
        `/admin/challenges/${challengeId}/submissions`,
        p
      );
      return (response.data.submissions || []).map((s) => normalizeKeys<ChallengeSubmission>(s as any));
    },
    enabled: !!challengeId,
  });
};

export const useReviewAdminChallengeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      challengeId: string;
      submissionId: string;
      status: 'approved' | 'rejected';
      adminNote?: string;
      isFeatured?: boolean;
      featuredPosition?: number | null;
    }) => {
      const response = await apiClient.patch<ApiResponse<{ submission: ChallengeSubmission }>>(
        `/admin/challenge-submissions/${payload.submissionId}/review`,
        {
          status: payload.status,
          ...(payload.adminNote ? { adminNote: payload.adminNote } : {}),
          ...(payload.isFeatured !== undefined ? { isFeatured: payload.isFeatured } : {}),
          ...(payload.featuredPosition !== undefined ? { featuredPosition: payload.featuredPosition } : {}),
        }
      );
      return normalizeKeys<ChallengeSubmission>(response.data.data.submission as any);
    },
    onSuccess: (_s, variables) => {
      queryClient.invalidateQueries({ queryKey: adminChallengeKeys.submissions(variables.challengeId, {}) });
      queryClient.invalidateQueries({ queryKey: adminChallengeKeys.all });
    },
  });
};

export const useSetAdminFeaturedOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { challengeId: string; submissionIds: string[] }) => {
      const response = await apiClient.put<ApiResponse<{ featured: string[] }>>(
        `/admin/challenges/${payload.challengeId}/featured`,
        { submissionIds: payload.submissionIds }
      );
      return response.data.data.featured;
    },
    onSuccess: (_featured, variables) => {
      queryClient.invalidateQueries({ queryKey: adminChallengeKeys.submissions(variables.challengeId, {}) });
    },
  });
};
