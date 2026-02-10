import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { NotFoundError, ValidationError } from '../utils/errors';

// Public endpoints for Vibe Code Challenge

export const listChallenges = catchAsync(async (req: Request, res: Response) => {
  const { status, page = 1, limit = 20 } = req.query as { status?: string; page?: any; limit?: any };

  const parsedPage = Math.floor(Number(page));
  const parsedLimit = Math.floor(Number(limit));
  const sanitizedPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const sanitizedLimit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(100, parsedLimit);
  const from = (sanitizedPage - 1) * sanitizedLimit;
  const to = from + sanitizedLimit - 1;

  let q = supabase
    .from('challenges')
    .select('id, title, slug, theme, coverImage, status, startAt, endAt, createdAt, updatedAt', { count: 'exact' })
    .order('startAt', { ascending: false })
    .range(from, to);

  if (status) {
    if (!['upcoming', 'active', 'ended'].includes(status)) {
      throw new ValidationError('Invalid status. Must be: upcoming, active, ended');
    }
    q = q.eq('status', status);
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

export const getChallengeBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !challenge) {
    throw new NotFoundError('Challenge not found');
  }

  // Public view: show only approved submissions.
  const { data: submissions, error: subError } = await supabase
    .from('challenge_submissions')
    .select(
      `id, title, description, demoUrl, repoUrl, status, isFeatured, featuredPosition, featuredAt, createdAt,
       user:users(id, name, username, avatar),
       website:websites(id, name, slug, thumbnail, shortDescription, status)`
    )
    .eq('challengeId', challenge.id)
    .eq('status', 'approved')
    .order('isFeatured', { ascending: false })
    .order('featuredPosition', { ascending: true, nullsFirst: false })
    .order('createdAt', { ascending: false });

  if (subError) throw subError;

  res.status(200).json({
    success: true,
    data: {
      challenge,
      submissions: submissions || [],
    },
    timestamp: new Date().toISOString(),
  });
});
