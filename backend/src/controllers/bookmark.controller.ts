// ============================================
// Bookmark Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';
import { CreateBookmarkRequest } from '../types/bookmark.types';

/**
 * @desc    Get current user's bookmarks
 * @route   GET /api/v1/bookmarks
 * @access  Private
 */
export const getMyBookmarks = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select(`
      *,
      website:websites(
        id,
        name,
        slug,
        thumbnail,
        category:categories(name, slug),
        creator:users(name, username)
      )
    `)
    .eq('userId', req.user.id)
    .order('createdAt', { ascending: false });

  if (error) throw error;

  res.status(200).json({
    success: true,
    data: { bookmarks: bookmarks || [] },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Create bookmark
 * @route   POST /api/v1/bookmarks
 * @access  Private
 */
export const createBookmark = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { websiteId } = req.body as CreateBookmarkRequest;

  if (!websiteId) {
    throw new ValidationError('Website ID is required');
  }

  // Check if website exists
  const { data: website, error: websiteError } = await supabase
    .from('websites')
    .select('id, name, slug, thumbnail')
    .eq('id', websiteId)
    .single();

  if (websiteError || !website) {
    throw new NotFoundError('Website not found');
  }

  // Check if already bookmarked
  const { data: existingBookmark } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('websiteId', websiteId)
    .eq('userId', req.user.id)
    .single();

  if (existingBookmark) {
    throw new ConflictError('Website already bookmarked');
  }

  // Create bookmark
  const { data: bookmark, error } = await supabase
    .from('bookmarks')
    .insert({
      websiteId: websiteId,
      userId: req.user.id,
    })
    .select(`
      *,
      website:websites(
        id,
        name,
        slug,
        thumbnail,
        category:categories(name, slug),
        creator:users(name, username)
      )
    `)
    .single();

  // Handle unique constraint violation (race condition / duplicate insert)
  if (error) {
    if (error.code === '23505') { // Unique violation
      throw new ConflictError('Website already bookmarked');
    }
    throw error;
  }

  res.status(201).json({
    success: true,
    data: { bookmark },
    message: 'Website bookmarked successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Delete bookmark
 * @route   DELETE /api/v1/bookmarks/:websiteId
 * @access  Private
 */
export const deleteBookmark = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { websiteId } = req.params;

  // Check if bookmark exists
  const { data: bookmark, error: findError } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('websiteId', websiteId)
    .eq('userId', req.user.id)
    .single();

  if (findError || !bookmark) {
    throw new NotFoundError('Bookmark not found');
  }

  // Delete bookmark
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('websiteId', websiteId)
    .eq('userId', req.user.id);

  if (error) throw error;

  res.status(200).json({
    success: true,
    message: 'Bookmark removed successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Check if website is bookmarked
 * @route   GET /api/v1/bookmarks/check/:websiteId
 * @access  Private
 */
export const checkBookmark = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { websiteId } = req.params;

  const { data: bookmark } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('websiteId', websiteId)
    .eq('userId', req.user.id)
    .single();

  res.status(200).json({
    success: true,
    data: { isBookmarked: !!bookmark },
    timestamp: new Date().toISOString(),
  });
});
