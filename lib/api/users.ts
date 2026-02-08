// ============================================
// User API Hooks - Finding Gems Frontend
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { normalizeKeys } from './normalize';
import type { Website } from './websites';

// ============================================
// Types
// ============================================

export interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'creator';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  creator_profiles?: {
    userId: string;
    bio: string;
    professionalBackground?: string;
    expertise: string[];
    portfolioUrl?: string;
    motivation?: string;
    isVerified: boolean;
    rating: number;
    reviewCount: number;
    totalWebsites: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreatorProfileResponse {
  creator: CreatorProfile;
  websites: Website[];
}

// ============================================
// Query Keys
// ============================================

export const userKeys = {
  all: ['users'] as const,
  creators: () => [...userKeys.all, 'creators'] as const,
  creator: (username: string) => [...userKeys.creators(), username] as const,
  creatorWebsites: (creatorId: string) => [...userKeys.all, 'creator-websites', creatorId] as const,
};

// ============================================
// Creator Profile Hooks
// ============================================

/**
 * Get public creator profile by username
 * Uses: GET /api/v1/creators/:username
 * Access: Public (no auth required)
 */
export function useCreatorProfile(username: string) {
  return useQuery({
    queryKey: userKeys.creator(username),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: {
          creator: any;
          websites: any[];
        };
      }>(`/creators/${username}`);
      
      // Normalize snake_case to camelCase
      const creator = normalizeKeys<CreatorProfile>(response.data.creator);
      const websites = response.data.websites.map(w => normalizeKeys<Website>(w));
      
      return {
        creator,
        websites,
      } as CreatorProfileResponse;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get creator's websites by creator ID
 * Uses: GET /api/v1/websites?creatorId=xxx
 * Access: Public
 * Note: This is alternative if you need to fetch websites separately
 */
export function useCreatorWebsites(creatorId: string) {
  return useQuery({
    queryKey: userKeys.creatorWebsites(creatorId),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: {
          websites: any[];
        };
      }>('/websites', {
        params: { 
          creatorId,
          limit: 50 
        }
      });
      
      return response.data.websites.map(w => normalizeKeys<Website>(w));
    },
    enabled: !!creatorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================
// Creator Settings Hooks (Private - /creators/me)
// ============================================

export interface CreatorSettings {
  bio: string;
  professionalBackground?: string;
  expertise: string[];
  portfolioUrl?: string;
}

export interface CreatorSettingsResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  creatorProfiles?: {
    bio: string;
    professionalBackground?: string;
    expertise: string[];
    portfolioUrl?: string;
    isVerified: boolean;
    rating: number;
    reviewCount: number;
  };
}

/**
 * Get current creator's own profile settings
 * Uses: GET /api/v1/creators/me
 * Access: Creator only (requires auth)
 */
export function useMyCreatorSettings() {
  return useQuery({
    queryKey: ['creator', 'me', 'settings'],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: CreatorSettingsResponse;
      }>('/creators/me');
      
      return normalizeKeys<CreatorSettingsResponse>(response.data);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Update current creator's profile settings
 * Uses: PATCH /api/v1/creators/me
 * Access: Creator only (requires auth)
 */
export function useUpdateCreatorSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatorSettings) => {
      const response = await api.patch<{
        success: boolean;
        data: CreatorSettingsResponse;
        message: string;
      }>('/creators/me', data);
      
      return normalizeKeys<CreatorSettingsResponse>(response.data);
    },
    onSuccess: () => {
      // Invalidate the settings query to refresh data
      queryClient.invalidateQueries({ queryKey: ['creator', 'me', 'settings'] });
    },
  });
}
