import { supabase } from '../config/supabase';

// Best-effort thread creation helper (no transaction).
export async function getOrCreateThread(params: {
  userAId: string;
  userBId: string;
  websiteId?: string | null;
  requestId?: string | null;
}) {
  const { userAId, userBId } = params;
  const websiteId = params.websiteId || null;
  const requestId = params.requestId || null;

  const { data: participantRows, error: partFindError } = await supabase
    .from('thread_participants')
    .select('thread_id, user_id')
    .in('user_id', [userAId, userBId]);
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
    if (existingThread?.id) return existingThread.id as string;
  }

  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .insert({ website_id: websiteId, request_id: requestId })
    .select('id')
    .single();
  if (threadError) throw threadError;

  const now = new Date().toISOString();
  const { error: partErr } = await supabase.from('thread_participants').insert([
    { thread_id: thread.id, user_id: userAId, unread_count: 0, joined_at: now, last_read_at: now },
    { thread_id: thread.id, user_id: userBId, unread_count: 0, joined_at: now },
  ]);
  if (partErr) throw partErr;

  return thread.id as string;
}
