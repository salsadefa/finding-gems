// ============================================
// Bookmark Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { prisma } from '../config/database';
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

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      website: {
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          creator: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: { bookmarks },
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
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
  });

  if (!website) {
    throw new NotFoundError('Website not found');
  }

  // Check if already bookmarked
  const existingBookmark = await prisma.bookmark.findUnique({
    where: {
      websiteId_userId: {
        websiteId,
        userId: req.user.id,
      },
    },
  });

  if (existingBookmark) {
    throw new ConflictError('Website already bookmarked');
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      websiteId,
      userId: req.user.id,
    },
    include: {
      website: {
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          creator: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      },
    },
  });

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
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      websiteId_userId: {
        websiteId,
        userId: req.user.id,
      },
    },
  });

  if (!bookmark) {
    throw new NotFoundError('Bookmark not found');
  }

  await prisma.bookmark.delete({
    where: {
      websiteId_userId: {
        websiteId,
        userId: req.user.id,
      },
    },
  });

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

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      websiteId_userId: {
        websiteId,
        userId: req.user.id,
      },
    },
  });

  res.status(200).json({
    success: true,
    data: { isBookmarked: !!bookmark },
    timestamp: new Date().toISOString(),
  });
});
