'use client';

import { useMemo, useState } from 'react';
import {
  useAdminChallenges,
  useCreateAdminChallenge,
  useAdminChallengeSubmissions,
  useReviewAdminChallengeSubmission,
  useSetAdminFeaturedOrder,
} from '@/lib/api/admin-challenges';

function isoLocal(dt?: string) {
  if (!dt) return '';
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ChallengesTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');

  const { data, isLoading, error } = useAdminChallenges({ page, limit: 10, search: search || undefined, status: status || undefined });
  const challenges = data?.challenges || [];
  const pagination = data?.pagination;

  const createChallenge = useCreateAdminChallenge();
  const reviewSubmission = useReviewAdminChallengeSubmission();
  const setFeaturedOrder = useSetAdminFeaturedOrder();

  const submissionsQuery = useAdminChallengeSubmissions(selectedChallengeId, {});
  const submissions = submissionsQuery.data || [];

  const featuredIds = useMemo(() => {
    return submissions
      .filter((s) => s.isFeatured)
      .sort((a, b) => (a.featuredPosition || 9999) - (b.featuredPosition || 9999))
      .map((s) => s.id);
  }, [submissions]);

  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [newRules, setNewRules] = useState('');
  const [newStartAt, setNewStartAt] = useState('');
  const [newEndAt, setNewEndAt] = useState('');
  const [newStatus, setNewStatus] = useState<'upcoming' | 'active' | 'ended'>('upcoming');

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createChallenge.mutateAsync({
      title: newTitle,
      slug: newSlug,
      theme: newTheme || undefined,
      rules: newRules || undefined,
      startAt: new Date(newStartAt).toISOString(),
      endAt: new Date(newEndAt).toISOString(),
      status: newStatus,
    });
    setNewTitle('');
    setNewSlug('');
    setNewTheme('');
    setNewRules('');
    setNewStartAt('');
    setNewEndAt('');
    setNewStatus('upcoming');
  };

  const toggleApprove = async (submissionId: string, next: 'approved' | 'rejected') => {
    if (!selectedChallengeId) return;
    await reviewSubmission.mutateAsync({
      challengeId: selectedChallengeId,
      submissionId,
      status: next,
    });
  };

  const toggleFeatured = async (submissionId: string, current: boolean | undefined) => {
    if (!selectedChallengeId) return;
    await reviewSubmission.mutateAsync({
      challengeId: selectedChallengeId,
      submissionId,
      status: 'approved',
      isFeatured: !current,
    });
  };

  const onSaveFeaturedOrder = async () => {
    if (!selectedChallengeId) return;
    await setFeaturedOrder.mutateAsync({ challengeId: selectedChallengeId, submissionIds: featuredIds });
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Challenges</h2>
          <p className="text-sm text-gray-500 mt-1">Create challenges, review submissions, and feature winners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title/slug..."
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg">
                <option value="">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
            >
              <option value="">Select challenge…</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">Failed to load challenges.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {challenges.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChallengeId(c.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 ${selectedChallengeId === c.id ? 'bg-blue-50/40' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                      <p className="text-xs text-gray-500">/{c.slug} • {c.status} • {new Date(c.startAt).toLocaleDateString()} – {new Date(c.endAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 ? (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="px-3 py-1.5 text-sm border border-gray-300 bg-white rounded-lg disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1.5 text-sm border border-gray-300 bg-white rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900">Create Challenge</h3>
          <form className="mt-4 space-y-3" onSubmit={onCreate}>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="Title" required />
            <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="Slug" required />
            <input value={newTheme} onChange={(e) => setNewTheme(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="Theme (optional)" />
            <textarea value={newRules} onChange={(e) => setNewRules(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg min-h-[90px]" placeholder="Rules (optional)" />
            <div className="grid grid-cols-2 gap-2">
              <input type="datetime-local" value={newStartAt} onChange={(e) => setNewStartAt(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" required />
              <input type="datetime-local" value={newEndAt} onChange={(e) => setNewEndAt(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" required />
            </div>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
              <option value="upcoming">upcoming</option>
              <option value="active">active</option>
              <option value="ended">ended</option>
            </select>
            <button
              type="submit"
              disabled={createChallenge.isPending}
              className="w-full rounded-full bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
            >
              Create
            </button>
          </form>
        </div>
      </div>

      {selectedChallengeId ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Submissions</h3>
              <p className="text-xs text-gray-500">Approve/reject and mark featured.</p>
            </div>
            <button
              onClick={onSaveFeaturedOrder}
              disabled={setFeaturedOrder.isPending}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Save featured order
            </button>
          </div>

          {submissionsQuery.isLoading ? (
            <div className="p-6 text-sm text-gray-500">Loading submissions…</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {submissions.length === 0 ? (
                <div className="p-6 text-sm text-gray-600">No submissions yet.</div>
              ) : submissions.map((s) => (
                <div key={s.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        s.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : s.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>{s.status}</span>
                      {s.isFeatured ? (
                        <span className="text-xs px-2 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">featured</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {s.user?.name ? `by ${s.user.name}` : ''}
                      {s.website?.slug ? ` • listing: ${s.website.slug}` : ''}
                    </p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{s.description}</p>
                    <div className="mt-2 text-xs">
                      <a href={s.demoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">demo</a>
                      {s.repoUrl ? <span className="text-gray-400"> • </span> : null}
                      {s.repoUrl ? <a href={s.repoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">repo</a> : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleApprove(s.id, 'approved')}
                      disabled={reviewSubmission.isPending}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => toggleApprove(s.id, 'rejected')}
                      disabled={reviewSubmission.isPending}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => toggleFeatured(s.id, s.isFeatured)}
                      disabled={reviewSubmission.isPending || s.status !== 'approved'}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                    >
                      {s.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
