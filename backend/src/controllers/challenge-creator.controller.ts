import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { CreateChallengeSubmissionBody, UpdateChallengeSubmissionBody } from '../types/challenge.types';

const isWithinWindow = (challenge: any) => {
  const now = Date.now();
  const start = Date.parse(challenge.startAt);
  const end = Date.parse(challenge.endAt);
  return !Number.isNaN(start) && !Number.isNaN(end) && now >= start && now <= end;
};

async function resolveWebsiteIdForCreator(input: { websiteId?: string; websiteSlug?: string }, creatorId: string) {
  if (!input.websiteId && !input.websiteSlug) return null;

  let q = supabase.from('websites').select('id, creatorId').eq('creatorId', creatorId);
  if (input.websiteId) q = q.eq('id', input.websiteId);
  if (input.websiteSlug) q = q.eq('slug', input.websiteSlug);

  const { data: website, error } = await q.single();
  if (error || !website) {
    throw new ValidationError('Invalid website reference. You can only attach your own listing.');
  }
  return website.id;
}

export const createChallengeSubmission = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ForbiddenError('Authentication required');
  if (req.user.role !== 'creator') throw new ForbiddenError('Only creators can submit to challenges');

  const { slug } = req.params;
  const body = req.body as CreateChallengeSubmissionBody;

  if (!body.title || !body.description || !body.demoUrl) {
    throw new ValidationError('title, description, and demoUrl are required');
  }

  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !challenge) throw new NotFoundError('Challenge not found');

  if (challenge.status !== 'active' || !isWithinWindow(challenge)) {
    throw new ForbiddenError('Challenge is not accepting submissions');
  }

  const websiteId = await resolveWebsiteIdForCreator({ websiteId: body.websiteId, websiteSlug: body.websiteSlug }, req.user.id);

  const insertData: any = {
    challengeId: challenge.id,
    userId: req.user.id,
    websiteId,
    title: body.title,
    description: body.description,
    demoUrl: body.demoUrl,
    repoUrl: body.repoUrl || null,
    status: 'submitted',
  };

  const { data: submission, error: insertError } = await supabase
    .from('challenge_submissions')
    .insert(insertData)
    .select(
       `id, title, description, demoUrl, repoUrl, status, createdAt,
        website:websites(id, name, slug, thumbnail, shortDescription),
        user:users!challenge_submissions_userId_fkey(id, name, username, avatar)`
     )
    .single();

  if (insertError) {
    // Unique constraint: one submission per creator per challenge.
    if ((insertError as any).code === '23505') {
      throw new ValidationError('You already submitted to this challenge');
    }
    throw insertError;
  }

  res.status(201).json({
    success: true,
    data: { submission },
    message: 'Submission created',
    timestamp: new Date().toISOString(),
  });
});

export const updateChallengeSubmission = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ForbiddenError('Authentication required');
  if (req.user.role !== 'creator') throw new ForbiddenError('Only creators can update submissions');

  const { id } = req.params;
  const body = req.body as UpdateChallengeSubmissionBody;

  const { data: existing, error } = await supabase
    .from('challenge_submissions')
    .select('id, userId, challengeId, status')
    .eq('id', id)
    .single();

  if (error || !existing) throw new NotFoundError('Submission not found');
  if (existing.userId !== req.user.id) throw new ForbiddenError('Not allowed');

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', existing.challengeId)
    .single();

  if (!challenge) throw new NotFoundError('Challenge not found');
  if (challenge.status !== 'active' || !isWithinWindow(challenge)) {
    throw new ForbiddenError('Challenge is not accepting updates');
  }
  if (existing.status !== 'submitted') {
    throw new ForbiddenError('Only submitted entries can be updated');
  }

  const websiteId = await resolveWebsiteIdForCreator({ websiteId: body.websiteId, websiteSlug: body.websiteSlug }, req.user.id);

  const updateData: any = {
    updatedAt: new Date().toISOString(),
  };
  if (typeof body.title === 'string') updateData.title = body.title;
  if (typeof body.description === 'string') updateData.description = body.description;
  if (typeof body.demoUrl === 'string') updateData.demoUrl = body.demoUrl;
  if (typeof body.repoUrl === 'string') updateData.repoUrl = body.repoUrl;
  if (body.repoUrl === null as any) updateData.repoUrl = null;
  if (body.websiteId !== undefined || body.websiteSlug !== undefined) updateData.websiteId = websiteId;

  const { data: submission, error: updateError } = await supabase
    .from('challenge_submissions')
    .update(updateData)
    .eq('id', id)
    .select(
       `id, title, description, demoUrl, repoUrl, status, createdAt, updatedAt,
        website:websites(id, name, slug, thumbnail, shortDescription),
        user:users!challenge_submissions_userId_fkey(id, name, username, avatar)`
     )
    .single();

  if (updateError) throw updateError;

  res.status(200).json({
    success: true,
    data: { submission },
    message: 'Submission updated',
    timestamp: new Date().toISOString(),
  });
});

export const getMyChallengeSubmission = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ForbiddenError('Authentication required');
  if (req.user.role !== 'creator') throw new ForbiddenError('Only creators can access submissions');

  const { slug } = req.params;

  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('id, slug, status, startAt, endAt')
    .eq('slug', slug)
    .single();

  if (error || !challenge) throw new NotFoundError('Challenge not found');

  const { data: submission, error: subError } = await supabase
    .from('challenge_submissions')
    .select(
      `id, title, description, demoUrl, repoUrl, status, adminNote, isFeatured, featuredPosition, createdAt, updatedAt,
       website:websites(id, name, slug, thumbnail, shortDescription)`
    )
    .eq('challengeId', challenge.id)
    .eq('userId', req.user.id)
    .maybeSingle();

  if (subError) throw subError;

  res.status(200).json({
    success: true,
    data: { submission: submission || null },
    timestamp: new Date().toISOString(),
  });
});
