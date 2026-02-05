// ============================================
// Category API Hooks - Finding Gems Frontend
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

// Keys for caching
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

// Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: { categories: Category[] } }>(
        '/categories'
      );
      return response.data.categories;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  });
};

// Get category by ID
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: { category: Category } }>(
        `/categories/${id}`
      );
      return response.data.category;
    },
    enabled: !!id,
  });
};

// Create category (admin only)
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await api.post<{ success: boolean; data: { category: Category } }>(
        '/categories',
        data
      );
      return response.data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

// Update category (admin only)
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCategoryData> }) => {
      const response = await api.patch<{ success: boolean; data: { category: Category } }>(
        `/categories/${id}`,
        data
      );
      return response.data.category;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

// Delete category (admin only)
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};
