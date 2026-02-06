// ============================================
// Website Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import {
  CreateWebsiteRequest,
  UpdateWebsiteRequest,
  WebsiteFilters,
  PaginationParams,
} from '../types/website.types';

/**
 * Generate slug from name
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * @desc    Get all websites with filters, pagination, and sorting
 * @route   GET /api/v1/websites
 * @access  Public
 */
export const getWebsites = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search,
    category,
    status,
    hasFreeTrial,
    minRating,
  } = req.query as PaginationParams & WebsiteFilters;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build query
  let query = supabase
    .from('websites')
    .select(
      `*, 
      creator:users(id, name, username, avatar), 
      category:categories(id, name, slug, icon)`,
      { count: 'exact' }
    );

  // Only show active websites to non-admins/creators
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'creator')) {
    query = query.eq('status', 'active');
  } else if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`);
  }

  if (category) {
    query = query.eq('categories.slug', category);
  }

  if (hasFreeTrial !== undefined) {
    query = query.eq('has_free_trial', String(hasFreeTrial) === 'true');
  }

  if (minRating) {
    query = query.gte('rating', Number(minRating));
  }

  const { data: websites, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      websites: websites || [],
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get website by ID or slug
 * @route   GET /api/v1/websites/:id
 * @access  Public
 */
export const getWebsiteById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if ID is a UUID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = supabase
    .from('websites')
    .select(
      `*, 
      creator:users(id, name, username, avatar), 
      category:categories(id, name, slug, icon, description),
      reviews:reviews(*, user:users(id, name, username, avatar))`
    );

  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('slug', id);
  }

  const { data: website, error } = await query.single();

  if (error || !website) {
    throw new NotFoundError('Website not found');
  }

  // Only active websites are visible to public
  if (website.status !== 'active') {
    if (!req.user) {
      throw new NotFoundError('Website not found');
    }

    const isCreator = website.creator_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      throw new NotFoundError('Website not found');
    }
  }

  // Increment view count
  await supabase
    .from('websites')
    .update({ view_count: (website.view_count || 0) + 1 })
    .eq('id', website.id);

  res.status(200).json({
    success: true,
    data: {
      website,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Create new website (creators only)
 * @route   POST /api/v1/websites
 * @access  Private (Creator)
 */
export const createWebsite = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  // Only creators and admins can create websites
  if (req.user.role !== 'creator' && req.user.role !== 'admin') {
    throw new ForbiddenError('Only creators can create websites');
  }

  const {
    name,
    description,
    shortDescription,
    categoryId,
    externalUrl,
    thumbnail,
    screenshots,
    techStack,
    useCases,
    hasFreeTrial,
  } = req.body as CreateWebsiteRequest;

  // Validate required fields
  if (!name || !description || !categoryId || !externalUrl) {
    throw new ValidationError('Name, description, categoryId, and externalUrl are required');
  }

  // Check if category exists
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('id', categoryId)
    .single();

  if (categoryError || !category) {
    throw new NotFoundError('Category not found');
  }

  // Generate unique slug
  let slug = generateSlug(name);
  let slugExists = true;
  let counter = 1;

  while (slugExists) {
    const { data: existing } = await supabase
      .from('websites')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!existing) {
      slugExists = false;
    } else {
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }
  }

  // Create website
  const { data: website, error } = await supabase
    .from('websites')
    .insert({
      name: name.trim(),
      slug,
      description: description.trim(),
      shortDescription: shortDescription?.trim() || description.slice(0, 150).trim(),
      categoryId: categoryId,
      creatorId: req.user.id,
      thumbnail: thumbnail || '',
      screenshots: screenshots || [],
      externalUrl: externalUrl.trim(),
      techStack: techStack || [],
      useCases: useCases || [],
      hasFreeTrial: hasFreeTrial || false,
      status: 'pending',
    })
    .select(
      `*, 
      creator:users(id, name, username, avatar), 
      category:categories(id, name, slug, icon)`
    )
    .single();

  if (error) throw error;

  // Update creator profile website count
  await supabase.rpc('increment_creator_websites', { user_id: req.user.id });

  res.status(201).json({
    success: true,
    data: {
      website,
    },
    message: 'Website created successfully and is pending approval',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Update website (creator or admin)
 * @route   PATCH /api/v1/websites/:id
 * @access  Private (Creator/Admin)
 */
export const updateWebsite = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { id } = req.params;

  // Check if website exists
  const { data: existingWebsite, error: findError } = await supabase
    .from('websites')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !existingWebsite) {
    throw new NotFoundError('Website not found');
  }

  // Check ownership
  const isCreator = existingWebsite.creator_id === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCreator && !isAdmin) {
    throw new ForbiddenError('You can only update your own websites');
  }

  const {
    name,
    description,
    shortDescription,
    categoryId,
    externalUrl,
    thumbnail,
    screenshots,
    demoVideoUrl,
    techStack,
    useCases,
    hasFreeTrial,
    freeTrialDetails,
    status,
  } = req.body as UpdateWebsiteRequest;

  // If changing category, verify it exists
  if (categoryId && categoryId !== existingWebsite.categoryId) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .single();

    if (!category) {
      throw new NotFoundError('Category not found');
    }
  }

  // Build update data
  const updateData: any = {};

  if (name) {
    updateData.name = name.trim();
    if (name !== existingWebsite.name) {
      let slug = generateSlug(name);
      let slugExists = true;
      let counter = 1;

      while (slugExists) {
        const { data: existing } = await supabase
          .from('websites')
          .select('id')
          .eq('slug', slug)
          .neq('id', id)
          .single();

        if (!existing) {
          slugExists = false;
        } else {
          slug = `${generateSlug(name)}-${counter}`;
          counter++;
        }
      }
      updateData.slug = slug;
    }
  }

  if (description) updateData.description = description.trim();
  if (shortDescription) updateData.shortDescription = shortDescription.trim();
  if (categoryId) updateData.categoryId = categoryId;
  if (externalUrl) updateData.externalUrl = externalUrl.trim();
  if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
  if (screenshots !== undefined) updateData.screenshots = screenshots;
  if (techStack !== undefined) updateData.techStack = techStack;
  if (useCases !== undefined) updateData.useCases = useCases;
  if (hasFreeTrial !== undefined) updateData.hasFreeTrial = hasFreeTrial;

  // Only admin can change status
  if (status && isAdmin) {
    updateData.status = status;
  }

  const { data: updatedWebsite, error } = await supabase
    .from('websites')
    .update(updateData)
    .eq('id', id)
    .select(
      `*, 
      creator:users(id, name, username, avatar), 
      category:categories(id, name, slug, icon)`
    )
    .single();

  if (error) throw error;

  res.status(200).json({
    success: true,
    data: {
      website: updatedWebsite,
    },
    message: 'Website updated successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Delete website (creator or admin)
 * @route   DELETE /api/v1/websites/:id
 * @access  Private (Creator/Admin)
 */
export const deleteWebsite = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  const { id } = req.params;

  // Check if website exists
  const { data: existingWebsite, error: findError } = await supabase
    .from('websites')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !existingWebsite) {
    throw new NotFoundError('Website not found');
  }

  // Check ownership
  const isCreator = existingWebsite.creator_id === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCreator && !isAdmin) {
    throw new ForbiddenError('You can only delete your own websites');
  }

  // Delete website
  const { error } = await supabase.from('websites').delete().eq('id', id);

  if (error) throw error;

  // Update creator profile website count
  await supabase.rpc('decrement_creator_websites', { user_id: existingWebsite.creator_id });

  res.status(200).json({
    success: true,
    message: 'Website deleted successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get current user's websites (creator only)
 * @route   GET /api/v1/websites/my-websites
 * @access  Private (Creator)
 */
export const getMyWebsites = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new NotFoundError('User not found');
  }

  if (req.user.role !== 'creator' && req.user.role !== 'admin') {
    throw new ForbiddenError('Only creators can have websites');
  }

  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
  } = req.query as PaginationParams & { status?: string };

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let query = supabase
    .from('websites')
    .select(
      `*, 
      category:categories(id, name, slug, icon)`,
      { count: 'exact' }
    )
    .eq('creator_id', req.user.id);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: websites, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(skip, skip + take - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: {
      websites: websites || [],
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    },
    timestamp: new Date().toISOString(),
  });
});
