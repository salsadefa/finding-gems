// ============================================
// Weekly Drops Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { NotFoundError } from '../utils/errors';

type CacheEntry<T> = { value: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 30 * 1000;

function getCache<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

function setCache<T>(key: string, value: T) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

const websiteSelect = `
  id, name, slug, shortDescription, thumbnail, rating, viewCount, hasFreeTrial, status, createdAt,
  creator:users(id, name, username, avatar),
  category:categories(id, name, slug, icon)
`;

/**
 * @desc    Get latest published weekly drop
 * @route   GET /api/v1/drops/latest
 * @access  Public
 */
export const getLatestDrop = catchAsync(async (_req: Request, res: Response) => {
  const cached = getCache<{ drop: unknown; items: unknown[] }>('drops:latest');
  if (cached) {
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return res.status(200).json({
      success: true,
      data: cached,
      timestamp: new Date().toISOString(),
    });
  }

  const now = new Date().toISOString();

  const { data: drop, error } = await supabase
    .from('drops')
    .select('id, title, slug, description, coverImage:"coverImage", status, publishAt:"publishAt", createdAt:"createdAt"')
    .eq('status', 'published')
    .lte('publishAt', now)
    .order('publishAt', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!drop) {
    const payload = { drop: null, items: [] };
    setCache('drops:latest', payload);
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return res.status(200).json({
      success: true,
      data: payload,
      timestamp: new Date().toISOString(),
    });
  }

  const { data: items, error: itemsError } = await supabase
    .from('drop_items')
    .select(`id, position, note, website:websites(${websiteSelect})`)
    .eq('dropId', drop.id)
    .order('position', { ascending: true });

  if (itemsError) throw itemsError;

  const payload = { drop, items: items || [] };
  setCache('drops:latest', payload);
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
  res.status(200).json({
    success: true,
    data: payload,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get a published drop by slug
 * @route   GET /api/v1/drops/:slug
 * @access  Public
 */
export const getDropBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const cacheKey = `drops:slug:${slug}`;
  const cached = getCache<{ drop: unknown; items: unknown[] }>(cacheKey);
  if (cached) {
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return res.status(200).json({
      success: true,
      data: cached,
      timestamp: new Date().toISOString(),
    });
  }

  const now = new Date().toISOString();

  const { data: drop, error } = await supabase
    .from('drops')
    .select('id, title, slug, description, coverImage:"coverImage", status, publishAt:"publishAt", createdAt:"createdAt"')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('publishAt', now)
    .maybeSingle();

  if (error) throw error;
  if (!drop) throw new NotFoundError('Drop not found');

  const { data: items, error: itemsError } = await supabase
    .from('drop_items')
    .select(`id, position, note, website:websites(${websiteSelect})`)
    .eq('dropId', drop.id)
    .order('position', { ascending: true });

  if (itemsError) throw itemsError;

  const payload = { drop, items: items || [] };
  setCache(cacheKey, payload);
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
  res.status(200).json({
    success: true,
    data: payload,
    timestamp: new Date().toISOString(),
  });
});
