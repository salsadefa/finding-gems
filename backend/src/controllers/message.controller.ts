import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { catchAsync } from '../utils/catchAsync';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';

function requireAuth(req: Request) {
  if (!req.user) throw new ForbiddenError('Authentication required');
}

async function requireParticipant(threadId: string, userId: string) {
  const { data, error } = await supabase
    .from('thread_participants')
    .select('id')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new ForbiddenError('Not allowed');
}

export const listThreads = catchAsync(async (req: Request, res: Response) => {
  requireAuth(req);

  const { data: threads, error } = await supabase.rpc('get_threads_for_user', {
    p_user_id: req.user.id,
  });

  if (error) throw error;

  const threadIds = (threads || []).map((t: any) => t.thread_id).filter(Boolean);
  if (threadIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: { threads: [] },
      timestamp: new Date().toISOString(),
    });
  }

  // Fetch participants (for display).
  const { data: participants, error: partError } = await supabase
    .from('thread_participants')
    .select('thread_id, user:users(id, name, username, avatar, role)')
    .in('thread_id', threadIds);
  if (partError) throw partError;

  const participantsByThread = new Map<string, any[]>();
  for (const row of participants || []) {
    const list = participantsByThread.get((row as any).thread_id) || [];
    list.push((row as any).user);
    participantsByThread.set((row as any).thread_id, list);
  }

  // Optional context lookups
  const websiteIds = Array.from(new Set((threads || []).map((t: any) => t.website_id).filter(Boolean)));
  const requestIds = Array.from(new Set((threads || []).map((t: any) => t.request_id).filter(Boolean)));

  const [websitesRes, requestsRes] = await Promise.all([
    websiteIds.length
      ? supabase.from('websites').select('id, name, slug, thumbnail, shortDescription, status').in('id', websiteIds)
      : Promise.resolve({ data: [] as any[], error: null } as any),
    requestIds.length
      ? supabase.from('tool_requests').select('id, title, status').in('id', requestIds)
      : Promise.resolve({ data: [] as any[], error: null } as any),
  ]);

  if (websitesRes.error) throw websitesRes.error;
  if (requestsRes.error) throw requestsRes.error;

  const websiteById = new Map((websitesRes.data || []).map((w: any) => [w.id, w]));
  const requestById = new Map((requestsRes.data || []).map((r: any) => [r.id, r]));

  const payload = (threads || []).map((t: any) => ({
    id: t.thread_id,
    websiteId: t.website_id || null,
    requestId: t.request_id || null,
    updatedAt: t.updated_at,
    lastMessageAt: t.last_message_at || null,
    lastMessagePreview: t.last_message_preview || null,
    lastMessageSenderId: t.last_message_sender_id || null,
    unreadCount: t.unread_count || 0,
    participants: participantsByThread.get(t.thread_id) || [],
    website: t.website_id ? websiteById.get(t.website_id) || null : null,
    request: t.request_id ? requestById.get(t.request_id) || null : null,
  }));

  res.status(200).json({
    success: true,
    data: { threads: payload },
    timestamp: new Date().toISOString(),
  });
});

export const createThread = catchAsync(async (req: Request, res: Response) => {
  requireAuth(req);

  const { otherUserId, websiteId, requestId } = req.body as {
    otherUserId?: string;
    websiteId?: string;
    requestId?: string;
  };

  if (!otherUserId) throw new ValidationError('otherUserId is required');
  if (otherUserId === req.user.id) throw new ValidationError('Cannot create a thread with yourself');

  // Verify the other user exists.
  const { data: other, error: otherErr } = await supabase
    .from('users')
    .select('id, role, isActive')
    .eq('id', otherUserId)
    .single();
  if (otherErr || !other) throw new NotFoundError('User not found');
  if (!other.isActive) throw new ValidationError('User is not active');

  // Reuse existing thread if one already exists for these 2 users + context.
  const { data: participantRows, error: partFindError } = await supabase
    .from('thread_participants')
    .select('thread_id, user_id')
    .in('user_id', [req.user.id, otherUserId]);
  if (partFindError) throw partFindError;

  const counts = new Map<string, Set<string>>();
  for (const row of participantRows || []) {
    const tid = (row as any).thread_id as string;
    const uid = (row as any).user_id as string;
    const set = counts.get(tid) || new Set<string>();
    set.add(uid);
    counts.set(tid, set);
  }

  const candidateThreadIds = Array.from(counts.entries())
    .filter(([, set]) => set.size === 2)
    .map(([tid]) => tid);

  if (candidateThreadIds.length > 0) {
    let q = supabase.from('threads').select('id').in('id', candidateThreadIds);
    if (websiteId) q = q.eq('website_id', websiteId);
    else q = q.is('website_id', null);
    if (requestId) q = q.eq('request_id', requestId);
    else q = q.is('request_id', null);

    const { data: existingThread, error: exErr } = await q.limit(1).maybeSingle();
    if (exErr) throw exErr;
    if (existingThread?.id) {
      return res.status(200).json({
        success: true,
        data: { threadId: existingThread.id },
        message: 'Thread exists',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Create new thread.
  const { data: thread, error } = await supabase
    .from('threads')
    .insert({ website_id: websiteId || null, request_id: requestId || null })
    .select('*')
    .single();
  if (error) throw error;

  // Add participants.
  const { error: partErr } = await supabase.from('thread_participants').insert([
    { thread_id: thread.id, user_id: req.user.id, unread_count: 0, joined_at: new Date().toISOString(), last_read_at: new Date().toISOString() },
    { thread_id: thread.id, user_id: otherUserId, unread_count: 0, joined_at: new Date().toISOString() },
  ]);
  if (partErr) throw partErr;

  res.status(201).json({
    success: true,
    data: { threadId: thread.id },
    message: 'Thread created',
    timestamp: new Date().toISOString(),
  });
});

export const listThreadMessages = catchAsync(async (req: Request, res: Response) => {
  requireAuth(req);

  const { id } = req.params;
  const { limit = 50, before } = req.query as any;

  const parsedLimit = Math.floor(Number(limit));
  const take = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 50 : Math.min(100, parsedLimit);

  await requireParticipant(id, req.user.id);

  let q = supabase
    .from('messages')
    .select('id, thread_id, sender_id, content, created_at')
    .eq('thread_id', id)
    .order('created_at', { ascending: false })
    .limit(take);

  if (before) {
    const t = Date.parse(String(before));
    if (Number.isNaN(t)) throw new ValidationError('before must be an ISO timestamp');
    q = q.lt('created_at', new Date(t).toISOString());
  }

  const { data: messages, error } = await q;
  if (error) throw error;

  // Return ascending for UI.
  const ordered = (messages || []).slice().reverse();

  res.status(200).json({
    success: true,
    data: { messages: ordered },
    timestamp: new Date().toISOString(),
  });
});

export const sendMessage = catchAsync(async (req: Request, res: Response) => {
  requireAuth(req);

  const { id } = req.params;
  const { content } = req.body as { content?: string };

  if (!content || !content.trim()) throw new ValidationError('content is required');

  await requireParticipant(id, req.user.id);

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      thread_id: id,
      sender_id: req.user.id,
      content: content.trim(),
      is_read: false,
    })
    .select('id, thread_id, sender_id, content, created_at')
    .single();
  if (error) throw error;

  res.status(201).json({
    success: true,
    data: { message },
    message: 'Message sent',
    timestamp: new Date().toISOString(),
  });
});

export const markThreadRead = catchAsync(async (req: Request, res: Response) => {
  requireAuth(req);

  const { id } = req.params;
  await requireParticipant(id, req.user.id);

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('thread_participants')
    .update({ unread_count: 0, last_read_at: now })
    .eq('thread_id', id)
    .eq('user_id', req.user.id);

  if (error) throw error;

  res.status(200).json({
    success: true,
    data: { threadId: id },
    message: 'Marked as read',
    timestamp: new Date().toISOString(),
  });
});
