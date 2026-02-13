import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { NotFoundError, ValidationError } from '../utils/errors';
import {
  CreateChallengeBody,
  UpdateChallengeBody,
  ReviewChallengeSubmissionBody,
} from '../types/challenge.types';

const validChallengeStatuses = ['upcoming', 'active', 'ended'];

function requireIsoDate(value: string, field: string) {
  const t = Date.parse(value);
  if (!value || Number.isNaN(t)) {
    throw new ValidationError(`${field} must be a valid ISO timestamp`);
  }
  return new Date(t).toISOString();
}

export const listChallengesAdmin = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, search } = req.query as any;
  const parsedPage = Math.floor(Number(page));
  const parsedLimit = Math.floor(Number(limit));
  const sanitizedPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const sanitizedLimit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(100, parsedLimit);
  const from = (sanitizedPage - 1) * sanitizedLimit;
  const to = from + sanitizedLimit - 1;

  let q = supabase
    .from('challenges')
    .select('*', { count: 'exact' })
    .order('createdAt', { ascending: false })
    .range(from, to);

  if (status) {
    if (!validChallengeStatuses.includes(status)) {
      throw new ValidationError('Invalid status. Must be: upcoming, active, ended');
    }
    q = q.eq('status', status);
  }

  if (search) {
    q = q.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  const { data, error, count } = await q;
  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / sanitizedLimit);

  res.status(200).json({
    success: true,
    data: {
      challenges: data || [],
      pagination: {
        page: sanitizedPage,
        limit: sanitizedLimit,
        total,
        totalPages,
        hasNext: sanitizedPage < totalPages,
        hasPrev: sanitizedPage > 1,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export const createChallengeAdmin = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as CreateChallengeBody;

  if (!body.title || !body.slug || !body.startAt || !body.endAt) {
    throw new ValidationError('title, slug, startAt, endAt are required');
  }

  const status = body.status || 'upcoming';
  if (!validChallengeStatuses.includes(status)) {
    throw new ValidationError('Invalid status. Must be: upcoming, active, ended');
  }

  const startAt = requireIsoDate(body.startAt, 'startAt');
  const endAt = requireIsoDate(body.endAt, 'endAt');
  if (Date.parse(startAt) >= Date.parse(endAt)) {
    throw new ValidationError('startAt must be before endAt');
  }

  const insertData = {
    title: body.title,
    slug: body.slug,
    theme: body.theme || null,
    rules: body.rules || null,
    coverImage: body.coverImage || null,
    status,
    startAt,
    endAt,
    createdBy: req.user?.id || null,
  };

  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert(insertData)
    .select('*')
    .single();

  if (error) throw error;

  res.status(201).json({
    success: true,
    data: { challenge },
    message: 'Challenge created',
    timestamp: new Date().toISOString(),
  });
});

export const getChallengeAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !challenge) throw new NotFoundError('Challenge not found');

  res.status(200).json({
    success: true,
    data: { challenge },
    timestamp: new Date().toISOString(),
  });
});

export const updateChallengeAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as UpdateChallengeBody;

  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (typeof body.title === 'string') updateData.title = body.title;
  if (typeof body.slug === 'string') updateData.slug = body.slug;
  if (typeof body.theme === 'string') updateData.theme = body.theme;
  if (typeof body.rules === 'string') updateData.rules = body.rules;
  if (typeof body.coverImage === 'string') updateData.coverImage = body.coverImage;
  if (typeof body.status === 'string') {
    if (!validChallengeStatuses.includes(body.status)) {
      throw new ValidationError('Invalid status. Must be: upcoming, active, ended');
    }
    updateData.status = body.status;
  }
  if (typeof body.startAt === 'string') updateData.startAt = requireIsoDate(body.startAt, 'startAt');
  if (typeof body.endAt === 'string') updateData.endAt = requireIsoDate(body.endAt, 'endAt');

  const { data: challenge, error } = await supabase
    .from('challenges')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !challenge) throw new NotFoundError('Challenge not found');

  res.status(200).json({
    success: true,
    data: { challenge },
    message: 'Challenge updated',
    timestamp: new Date().toISOString(),
  });
});

export const listChallengeSubmissionsAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.query as any;

  let q = supabase
    .from('challenge_submissions')
    .select(
       `id, title, description, demoUrl, repoUrl, status, adminNote, reviewedAt, reviewedBy, isFeatured, featuredPosition, featuredAt, createdAt, updatedAt,
        user:users!challenge_submissions_userId_fkey(id, name, username, email, avatar),
        website:websites(id, name, slug, thumbnail, shortDescription, status)`
     )
    .eq('challengeId', id)
    .order('createdAt', { ascending: false });

  if (status) {
    if (!['submitted', 'approved', 'rejected'].includes(status)) {
      throw new ValidationError('Invalid status. Must be: submitted, approved, rejected');
    }
    q = q.eq('status', status);
  }

  const { data, error } = await q;
  if (error) throw error;

  res.status(200).json({
    success: true,
    data: { submissions: data || [] },
    timestamp: new Date().toISOString(),
  });
});

export const reviewChallengeSubmissionAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as ReviewChallengeSubmissionBody;

  if (!body.status || !['approved', 'rejected'].includes(body.status)) {
    throw new ValidationError('status must be approved or rejected');
  }

  const updateData: Record<string, unknown> = {
    status: body.status,
    adminNote: body.adminNote || null,
    reviewedAt: new Date().toISOString(),
    reviewedBy: req.user?.id || null,
    updatedAt: new Date().toISOString(),
  };

  if (typeof body.isFeatured === 'boolean') {
    updateData.isFeatured = body.isFeatured;
    updateData.featuredAt = body.isFeatured ? new Date().toISOString() : null;
    if (!body.isFeatured) {
      updateData.featuredPosition = null;
    }
  }

  if (body.featuredPosition !== undefined) {
    updateData.featuredPosition = body.featuredPosition;
  }

  const { data: submission, error } = await supabase
    .from('challenge_submissions')
    .update(updateData)
    .eq('id', id)
    .select(
       `id, title, description, demoUrl, repoUrl, status, adminNote, reviewedAt, reviewedBy, isFeatured, featuredPosition, featuredAt, createdAt, updatedAt,
        user:users!challenge_submissions_userId_fkey(id, name, username, avatar),
        website:websites(id, name, slug, thumbnail, shortDescription, status)`
     )
    .single();

  if (error || !submission) throw new NotFoundError('Submission not found');

  res.status(200).json({
    success: true,
    data: { submission },
    message: 'Submission reviewed',
    timestamp: new Date().toISOString(),
  });
});

export const setFeaturedOrderAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { submissionIds } = req.body as { submissionIds?: string[] };

  if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
    throw new ValidationError('submissionIds must be a non-empty array');
  }

  // Verify all belong to challenge
  const { data: existing, error } = await supabase
    .from('challenge_submissions')
    .select('id, challengeId')
    .in('id', submissionIds);

  if (error) throw error;

  const mismatched = (existing || []).some((s: any) => s.challengeId !== id);
  if (mismatched || (existing || []).length !== submissionIds.length) {
    throw new ValidationError('All submissionIds must belong to the challenge');
  }

  // Clear existing featured flags for this challenge first.
  const { error: clearErr } = await supabase
    .from('challenge_submissions')
    .update({
      isFeatured: false,
      featuredPosition: null,
      featuredAt: null,
      updatedAt: new Date().toISOString(),
    })
    .eq('challengeId', id)
    .eq('isFeatured', true);
  if (clearErr) throw clearErr;

  // Bulk update positions sequentially.
  // Note: Supabase doesn't support multi-row ordered update in one call reliably; do sequential updates.
  for (let i = 0; i < submissionIds.length; i++) {
    const sid = submissionIds[i];
    const position = i + 1;
    const { error: upErr } = await supabase
      .from('challenge_submissions')
      .update({
        isFeatured: true,
        featuredPosition: position,
        featuredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', sid);
    if (upErr) throw upErr;
  }

  res.status(200).json({
    success: true,
    data: { featured: submissionIds },
    message: 'Featured order updated',
    timestamp: new Date().toISOString(),
  });
});
