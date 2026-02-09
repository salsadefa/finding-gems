// Weekly Drops API Hooks - Finding Gems Frontend

import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import { normalizeKeys } from './normalize';
import type { Website } from '@/lib/types';

export type DropStatus = 'draft' | 'published';

export interface Drop {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  status: DropStatus;
  publishAt?: string | null;
  createdAt: string;
}

export interface DropItem {
  id: string;
  position: number;
  note?: string | null;
  website: Website;
}

export interface DropResponse {
  drop: Drop | null;
  items: Array<{ id: string; position: number; note?: string | null; website: unknown }>;
}

export const dropKeys = {
  all: ['drops'] as const,
  latest: () => [...dropKeys.all, 'latest'] as const,
  bySlug: (slug: string) => [...dropKeys.all, 'slug', slug] as const,
};

export const useLatestDrop = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: dropKeys.latest(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: DropResponse }>('/drops/latest');
      const payload = response.data;
      return {
        drop: payload.drop,
        items: (payload.items || []).map((it) => ({
          id: it.id,
          position: it.position,
          note: it.note ?? null,
          website: normalizeKeys<Website>(it.website),
        })),
      } as { drop: Drop | null; items: DropItem[] };
    },
    staleTime: 60 * 1000,
    enabled,
  });
};

export const useDropBySlug = (slug: string) => {
  return useQuery({
    queryKey: dropKeys.bySlug(slug),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: DropResponse }>(`/drops/${slug}`);
      const payload = response.data;
      return {
        drop: payload.drop,
        items: (payload.items || []).map((it) => ({
          id: it.id,
          position: it.position,
          note: it.note ?? null,
          website: normalizeKeys<Website>(it.website),
        })),
      } as { drop: Drop | null; items: DropItem[] };
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
};
