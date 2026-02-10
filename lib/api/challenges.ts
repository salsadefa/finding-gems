import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiClient } from './client';
import type { Challenge, ChallengeSubmission, ChallengeStatus } from '@/lib/types';
import { normalizeKeys } from './normalize';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  timestamp?: string;
};

export const challengeKeys = {
  all: ['challenges'] as const,
  list: (params: Record<string, unknown>) => [...challengeKeys.all, 'list', params] as const,
  detail: (slug: string) => [...challengeKeys.all, 'detail', slug] as const,
  mySubmission: (slug: string) => [...challengeKeys.all, 'my-submission', slug] as const,
};

export const useChallenges = (
  params?: { status?: ChallengeStatus; page?: number; limit?: number },
  options?: { enabled?: boolean }
) => {
  const p = params || {};
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: challengeKeys.list(p),
    queryFn: async () => {
      const response = await api.get<
        ApiEnvelope<{
          challenges: Challenge[];
          pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
        }>
      >('/challenges', p);
      return {
        challenges: (response.data.challenges || []).map((c) => normalizeKeys<Challenge>(c as any)),
        pagination: response.data.pagination,
      };
    },
    staleTime: 30 * 1000,
    enabled,
  });
};

export const useChallengeBySlug = (slug: string) => {
  return useQuery({
    queryKey: challengeKeys.detail(slug),
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<{ challenge: Challenge; submissions: ChallengeSubmission[] }>>(
        `/challenges/${slug}`
      );
      return {
        challenge: normalizeKeys<Challenge>(response.data.challenge as any),
        submissions: (response.data.submissions || []).map((s) => normalizeKeys<ChallengeSubmission>(s as any)),
      };
    },
    enabled: !!slug,
    staleTime: 30 * 1000,
  });
};

export const useMyChallengeSubmission = (slug: string, options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: challengeKeys.mySubmission(slug),
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<{ submission: ChallengeSubmission | null }>>(
        `/challenges/${slug}/my-submission`
      );
      return response.data.submission ? normalizeKeys<ChallengeSubmission>(response.data.submission as any) : null;
    },
    enabled: !!slug && enabled,
  });
};

export const useCreateChallengeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      slug: string;
      title: string;
      description: string;
      demoUrl: string;
      repoUrl?: string;
      websiteSlug?: string;
    }) => {
      const response = await apiClient.post<ApiEnvelope<{ submission: ChallengeSubmission }>>(
        `/challenges/${payload.slug}/submissions`,
        {
          title: payload.title,
          description: payload.description,
          demoUrl: payload.demoUrl,
          ...(payload.repoUrl ? { repoUrl: payload.repoUrl } : {}),
          ...(payload.websiteSlug ? { websiteSlug: payload.websiteSlug } : {}),
        }
      );
      return normalizeKeys<ChallengeSubmission>(response.data.data.submission as any);
    },
    onSuccess: (_submission, variables) => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.detail(variables.slug) });
      queryClient.invalidateQueries({ queryKey: challengeKeys.mySubmission(variables.slug) });
    },
  });
};

export const useUpdateChallengeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      slug: string;
      title?: string;
      description?: string;
      demoUrl?: string;
      repoUrl?: string;
      websiteSlug?: string;
    }) => {
      const response = await apiClient.patch<ApiEnvelope<{ submission: ChallengeSubmission }>>(
        `/challenges/submissions/${payload.id}`,
        {
          ...(payload.title ? { title: payload.title } : {}),
          ...(payload.description ? { description: payload.description } : {}),
          ...(payload.demoUrl ? { demoUrl: payload.demoUrl } : {}),
          ...(payload.repoUrl !== undefined ? { repoUrl: payload.repoUrl } : {}),
          ...(payload.websiteSlug !== undefined ? { websiteSlug: payload.websiteSlug } : {}),
        }
      );
      return normalizeKeys<ChallengeSubmission>(response.data.data.submission as any);
    },
    onSuccess: (_submission, variables) => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.detail(variables.slug) });
      queryClient.invalidateQueries({ queryKey: challengeKeys.mySubmission(variables.slug) });
    },
  });
};
