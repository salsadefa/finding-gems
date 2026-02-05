// ============================================
// Bookmark API Hooks - Finding Gems Frontend
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Bookmark, Website } from '@/lib/types';

export type { Bookmark };

// Keys for caching
export const bookmarkKeys = {
  all: ['bookmarks'] as const,
  lists: () => [...bookmarkKeys.all, 'list'] as const,
  detail: (id: string) => [...bookmarkKeys.all, 'detail', id] as const,
  byWebsite: (websiteId: string) => [...bookmarkKeys.all, 'website', websiteId] as const,
  status: (websiteId: string) => [...bookmarkKeys.all, 'status', websiteId] as const,
};

// Get all bookmarks for the current user
export const useBookmarks = () => {
  return useQuery({
    queryKey: bookmarkKeys.lists(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: { bookmarks: Bookmark[] } }>(
        '/bookmarks'
      );
      return response.data.bookmarks;
    },
    staleTime: 1 * 60 * 1000, // 1 minute - bookmarks change frequently
  });
};

// Get bookmark by ID
export const useBookmark = (id: string) => {
  return useQuery({
    queryKey: bookmarkKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: { bookmark: Bookmark } }>(
        `/bookmarks/${id}`
      );
      return response.data.bookmark;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Check if a website is bookmarked by the current user
export const useBookmarkStatus = (websiteId: string) => {
  return useQuery({
    queryKey: bookmarkKeys.status(websiteId),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: { isBookmarked: boolean; bookmark?: Bookmark } }>(
        '/bookmarks/status',
        { websiteId }
      );
      return response.data;
    },
    enabled: !!websiteId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Create a new bookmark
export const useCreateBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (websiteId: string) => {
      const response = await api.post<{ success: boolean; data: { bookmark: Bookmark } }>(
        '/bookmarks',
        { websiteId }
      );
      return response.data.bookmark;
    },
    onSuccess: (_, websiteId) => {
      // Invalidate bookmarks list
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
      // Invalidate specific website bookmark status
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.status(websiteId) });
    },
  });
};

// Delete a bookmark by ID
export const useDeleteBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, websiteId }: { id: string; websiteId: string }) => {
      await api.delete(`/bookmarks/${id}`);
      return { id, websiteId };
    },
    onSuccess: (_, variables) => {
      // Invalidate bookmarks list
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
      // Invalidate specific website bookmark status
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.status(variables.websiteId) });
    },
  });
};

// Toggle bookmark status for a website
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ websiteId, isBookmarked, bookmarkId }: { 
      websiteId: string; 
      isBookmarked: boolean;
      bookmarkId?: string;
    }) => {
      if (isBookmarked && bookmarkId) {
        // Remove bookmark
        const response = await api.delete<{ success: boolean; data: { removed: boolean } }>(
          `/bookmarks/${bookmarkId}`
        );
        return { removed: true, bookmarkId, websiteId };
      } else {
        // Add bookmark
        const response = await api.post<{ success: boolean; data: { bookmark: Bookmark } }>(
          '/bookmarks',
          { websiteId }
        );
        return { removed: false, bookmark: response.data.bookmark, websiteId };
      }
    },
    onSuccess: (data) => {
      // Invalidate bookmarks list
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
      // Invalidate specific website bookmark status
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.status(data.websiteId) });
    },
  });
};
