// ============================================
// Weekly Drops Admin Controller - Finding Gems Backend
// ============================================

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

type CreateDropBody = {
  title: string;
  slug?: string;
  description?: string;
  coverImage?: string;
};

type UpdateDropBody = Partial<CreateDropBody> & {
  status?: 'draft' | 'published';
  publishAt?: string;
};

type SetItemsBody = {
  items: Array<{ websiteId?: string; websiteSlug?: string; note?: string }>;
};

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 1;

  // Try a few suffixes to avoid infinite loops.
  while (counter < 50) {
    const { data, error } = await supabase.from('drops').select('id').eq('slug', slug).maybeSingle();
    if (error) throw error;
    if (!data) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }

  throw new ConflictError('Unable to generate unique slug');
}

/**
 * @desc    List drops (admin)
 * @route   GET /api/v1/admin/drops
 * @access  Private (Admin only)
 */
export const listDropsAdmin = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status } = req.query as Record<string, string>;
  const parsedPage = Math.max(1, Math.floor(Number(page) || 1));
  const parsedLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 20)));
  const skip = (parsedPage - 1) * parsedLimit;

  let query = supabase
    .from('drops')
    .select('id, title, slug, description, coverImage:"coverImage", status, publishAt:"publishAt", createdAt:"createdAt"', {
      count: 'exact',
    });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query
    .order('publishAt', { ascending: false, nullsFirst: false })
    .order('createdAt', { ascending: false })
    .range(skip, skip + parsedLimit - 1);

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / parsedLimit);

  res.status(200).json({
    success: true,
    data: {
      drops: data || [],
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages,
        hasNext: parsedPage < totalPages,
        hasPrev: parsedPage > 1,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Get drop by id (admin)
 * @route   GET /api/v1/admin/drops/:id
 * @access  Private (Admin only)
 */
export const getDropAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: drop, error } = await supabase
    .from('drops')
    .select('id, title, slug, description, coverImage:"coverImage", status, publishAt:"publishAt", createdAt:"createdAt"')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!drop) throw new NotFoundError('Drop not found');

  const { data: items, error: itemsError } = await supabase
    .from('drop_items')
    .select('id, position, note, websiteId:"websiteId", website:websites(slug, name)')
    .eq('dropId', id)
    .order('position', { ascending: true });

  if (itemsError) throw itemsError;

  // Flatten website join into websiteSlug/websiteName for easier FE consumption
  const flatItems = (items || []).map((it: any) => ({
    id: it.id,
    position: it.position,
    note: it.note,
    websiteId: it.websiteId,
    websiteSlug: it.website?.slug || null,
    websiteName: it.website?.name || null,
  }));

  res.status(200).json({
    success: true,
    data: { drop, items: flatItems },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Create a new drop (draft)
 * @route   POST /api/v1/admin/drops
 * @access  Private (Admin only)
 */
export const createDropAdmin = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as CreateDropBody;

  if (!body?.title || body.title.trim().length < 3) {
    throw new ValidationError('Title must be at least 3 characters', [{ field: 'title', message: 'Too short' }]);
  }

  const baseSlug = (body.slug && body.slug.trim()) ? generateSlug(body.slug) : generateSlug(body.title);
  if (!baseSlug) {
    throw new ValidationError('Unable to generate slug', [{ field: 'slug', message: 'Invalid slug' }]);
  }

  const slug = await ensureUniqueSlug(baseSlug);

  const insertData: Record<string, unknown> = {
    title: body.title.trim(),
    slug,
    description: body.description?.trim() || null,
    coverImage: body.coverImage?.trim() || null,
    status: 'draft',
    publishAt: null,
    createdBy: req.user?.id || null,
    updatedAt: new Date().toISOString(),
  };

  const { data: drop, error } = await supabase
    .from('drops')
    .insert(insertData)
    .select('id, title, slug, description, coverImage:"coverImage", status, publishAt:"publishAt", createdAt:"createdAt"')
    .single();

  if (error) {
    // Unique constraint errors are common here.
    if (String(error.message || '').toLowerCase().includes('duplicate')) {
      throw new ConflictError('Drop slug already exists');
    }
    throw error;
  }

  res.status(201).json({
    success: true,
    data: { drop },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Update drop fields
 * @route   PATCH /api/v1/admin/drops/:id
 * @access  Private (Admin only)
 */
export const updateDropAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as UpdateDropBody;

  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.title !== undefined) updateData.title = String(body.title).trim();
  if (body.description !== undefined) updateData.description = body.description ? String(body.description).trim() : null;
  if (body.coverImage !== undefined) updateData.coverImage = body.coverImage ? String(body.coverImage).trim() : null;
  if (body.publishAt !== undefined) updateData.publishAt = body.publishAt ? new Date(body.publishAt).toISOString() : null;

  if (body.slug !== undefined) {
    const nextSlug = generateSlug(body.slug);
    if (!nextSlug) throw new ValidationError('Invalid slug', [{ field: 'slug', message: 'Invalid slug' }]);
    updateData.slug = nextSlug;
  }

  const { data: drop, error } = await supabase
    .from('drops')
    .update(updateData)
    .eq('id', id)
    .select('id, title, slug, description, coverImage:"coverImage", status, publishAt:"publishAt", createdAt:"createdAt"')
    .maybeSingle();

  if (error) throw error;
  if (!drop) throw new NotFoundError('Drop not found');

  res.status(200).json({
    success: true,
    data: { drop },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Replace drop items (order + notes)
 * @route   PUT /api/v1/admin/drops/:id/items
 * @access  Private (Admin only)
 */
export const setDropItemsAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as SetItemsBody;

  if (!Array.isArray(body?.items) || body.items.length === 0) {
    throw new ValidationError('Items are required', [{ field: 'items', message: 'Must be a non-empty array' }]);
  }

  const { data: existing, error: findError } = await supabase.from('drops').select('id').eq('id', id).maybeSingle();
  if (findError) throw findError;
  if (!existing) throw new NotFoundError('Drop not found');

  // Delete existing items then insert the new list.
  const { error: delError } = await supabase.from('drop_items').delete().eq('dropId', id);
  if (delError) throw delError;

  const rows: Array<Record<string, unknown>> = [];

  for (let i = 0; i < body.items.length; i += 1) {
    const it = body.items[i];
    let websiteId = it.websiteId;

    if (!websiteId && it.websiteSlug) {
      const { data: website, error: websiteError } = await supabase
        .from('websites')
        .select('id')
        .eq('slug', it.websiteSlug)
        .maybeSingle();
      if (websiteError) throw websiteError;
      if (!website) {
        throw new ValidationError('Invalid websiteSlug', [
          { field: `items[${i}].websiteSlug`, message: 'Website not found' },
        ]);
      }
      websiteId = website.id as string;
    }

    if (!websiteId) {
      throw new ValidationError('Each item must include websiteId or websiteSlug', [
        { field: `items[${i}]`, message: 'Missing website identifier' },
      ]);
    }

    rows.push({
      dropId: id,
      websiteId,
      position: i + 1,
      note: it.note ? String(it.note).trim() : null,
      updatedAt: new Date().toISOString(),
    });
  }

  const { data: inserted, error: insError } = await supabase
    .from('drop_items')
    .insert(rows)
    .select('id, position, note, websiteId:"websiteId"');

  if (insError) throw insError;

  // Touch drop updatedAt
  await supabase.from('drops').update({ updatedAt: new Date().toISOString() }).eq('id', id);

  res.status(200).json({
    success: true,
    data: { items: inserted || [] },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @desc    Publish a drop
 * @route   POST /api/v1/admin/drops/:id/publish
 * @access  Private (Admin only)
 */
export const publishDropAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const publishAt = req.body?.publishAt ? new Date(req.body.publishAt).toISOString() : new Date().toISOString();

  // Must have at least 1 item.
  const { count, error: countError } = await supabase
    .from('drop_items')
    .select('*', { count: 'exact', head: true })
    .eq('dropId', id);
  if (countError) throw countError;
  if (!count || count < 1) {
    throw new ValidationError('Drop must have at least 1 item before publishing', [
      { field: 'items', message: 'Add items first' },
    ]);
  }

  const { data: drop, error } = await supabase
    .from('drops')
    .update({ status: 'published', publishAt, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select('id, title, slug, description, coverImage:"coverImage", status, publishAt:"publishAt", createdAt:"createdAt"')
    .maybeSingle();

  if (error) throw error;
  if (!drop) throw new NotFoundError('Drop not found');

  res.status(200).json({
    success: true,
    data: { drop },
    timestamp: new Date().toISOString(),
  });
});
