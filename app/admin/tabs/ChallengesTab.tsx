'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  useAdminChallenges,
  useCreateAdminChallenge,
  useUpdateAdminChallenge,
  useAdminChallengeSubmissions,
  useReviewAdminChallengeSubmission,
  useSetAdminFeaturedOrder,
} from '@/lib/api/admin-challenges';
import {
  Plus, Pencil, Save, X, Trophy, Calendar, Eye, Image as ImageIcon,
  CheckCircle2, XCircle, Star, StarOff, ArrowUpDown, Clock, Zap,
} from 'lucide-react';

function isoLocal(dt?: string) {
  if (!dt) return '';
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ended: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const icons: Record<string, React.ReactNode> = {
    upcoming: <Clock size={12} />,
    active: <Zap size={12} />,
    ended: <CheckCircle2 size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.ended}`}>
      {icons[status] || icons.ended}
      {status}
    </span>
  );
}

// ─── Challenge Form Modal ───────────────────────────────
interface ChallengeFormData {
  title: string;
  slug: string;
  theme: string;
  rules: string;
  coverImage: string;
  startAt: string;
  endAt: string;
  status: 'upcoming' | 'active' | 'ended';
}

function ChallengeFormModal({
  open,
  onClose,
  initialData,
  onSubmit,
  isSubmitting,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<ChallengeFormData>;
  onSubmit: (data: ChallengeFormData) => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}) {
  const [form, setForm] = useState<ChallengeFormData>({
    title: '',
    slug: '',
    theme: '',
    rules: '',
    coverImage: '',
    startAt: '',
    endAt: '',
    status: 'upcoming',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        slug: initialData.slug || '',
        theme: initialData.theme || '',
        rules: initialData.rules || '',
        coverImage: initialData.coverImage || '',
        startAt: initialData.startAt ? isoLocal(initialData.startAt) : '',
        endAt: initialData.endAt ? isoLocal(initialData.endAt) : '',
        status: initialData.status || 'upcoming',
      });
    } else {
      setForm({ title: '', slug: '', theme: '', rules: '', coverImage: '', startAt: '', endAt: '', status: 'upcoming' });
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === 'create' ? 'Create Challenge' : 'Edit Challenge'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Vibe Code Challenge #3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 font-mono"
              placeholder="vibe-code-challenge-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <input
              value={form.theme}
              onChange={(e) => setForm({ ...form, theme: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Build a productivity dashboard"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-1.5"><ImageIcon size={14} /> Cover Image URL</span>
            </label>
            <input
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="https://..."
            />
            {form.coverImage && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 h-32">
                <img src={form.coverImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rules</label>
            <textarea
              value={form.rules}
              onChange={(e) => setForm({ ...form, rules: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 min-h-[90px]"
              placeholder="Challenge rules..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ChallengeFormData['status'] })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="upcoming">upcoming</option>
              <option value="active">active</option>
              <option value="ended">ended</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Challenge' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main ChallengesTab ─────────────────────────────────
export default function ChallengesTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);

  const { data, isLoading, error } = useAdminChallenges({ page, limit: 10, search: search || undefined, status: status || undefined });
  const challenges = data?.challenges || [];
  const pagination = data?.pagination;

  const createChallenge = useCreateAdminChallenge();
  const updateChallenge = useUpdateAdminChallenge();
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

  const handleCreate = async (data: ChallengeFormData) => {
    await createChallenge.mutateAsync({
      title: data.title,
      slug: data.slug,
      theme: data.theme || undefined,
      rules: data.rules || undefined,
      coverImage: data.coverImage || undefined,
      startAt: new Date(data.startAt).toISOString(),
      endAt: new Date(data.endAt).toISOString(),
      status: data.status,
    });
    setShowCreateModal(false);
  };

  const handleEdit = async (data: ChallengeFormData) => {
    if (!editingChallenge) return;
    await updateChallenge.mutateAsync({
      id: editingChallenge.id,
      title: data.title,
      slug: data.slug,
      theme: data.theme || undefined,
      rules: data.rules || undefined,
      coverImage: data.coverImage || undefined,
      startAt: new Date(data.startAt).toISOString(),
      endAt: new Date(data.endAt).toISOString(),
      status: data.status,
    });
    setShowEditModal(false);
    setEditingChallenge(null);
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
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Challenges</h2>
          <p className="text-sm text-gray-500 mt-1">Create challenges, review submissions, and feature winners.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={16} /> Create Challenge
        </button>
      </div>

      {/* Challenges List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-gray-50">
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title/slug..."
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg">
              <option value="">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
          </div>
          <p className="text-xs text-gray-500">{pagination?.total || 0} challenges total</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-sm text-gray-500 text-center">Loading…</div>
        ) : error ? (
          <div className="p-8 text-sm text-red-600 text-center">Failed to load challenges.</div>
        ) : challenges.length === 0 ? (
          <div className="p-8 text-sm text-gray-500 text-center">No challenges found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {challenges.map((c) => (
              <div
                key={c.id}
                className={`p-4 hover:bg-gray-50/50 transition-colors ${selectedChallengeId === c.id ? 'bg-blue-50/40 border-l-2 border-l-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    onClick={() => setSelectedChallengeId(c.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                      <StatusPill status={c.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="font-mono">/{c.slug}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(c.startAt).toLocaleDateString()} – {new Date(c.endAt).toLocaleDateString()}
                      </span>
                    </div>
                    {c.coverImage && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                        <ImageIcon size={11} /> Has cover image
                      </div>
                    )}
                  </button>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingChallenge(c);
                        setShowEditModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                      title="Edit challenge"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setSelectedChallengeId(c.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                      title="View submissions"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="px-3 py-1.5 text-sm border border-gray-200 bg-white rounded-lg disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-1.5 text-sm border border-gray-200 bg-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {/* Submissions Panel */}
      {selectedChallengeId ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div>
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">Submissions</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                For: {challenges.find(c => c.id === selectedChallengeId)?.title || selectedChallengeId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSaveFeaturedOrder}
                disabled={setFeaturedOrder.isPending || featuredIds.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ArrowUpDown size={13} /> Save featured order
              </button>
            </div>
          </div>

          {submissionsQuery.isLoading ? (
            <div className="p-8 text-sm text-gray-500 text-center">Loading submissions…</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {submissions.length === 0 ? (
                <div className="p-8 text-sm text-gray-500 text-center">No submissions yet.</div>
              ) : submissions.map((s) => (
                <div key={s.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        s.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : s.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>{s.status}</span>
                      {s.isFeatured ? (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                          <Star size={10} /> featured
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {s.user?.name ? `by ${s.user.name}` : ''}
                      {s.website?.slug ? ` • listing: ${s.website.slug}` : ''}
                    </p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{s.description}</p>
                    <div className="mt-2 text-xs flex items-center gap-3">
                      <a href={s.demoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">demo ↗</a>
                      {s.repoUrl ? <a href={s.repoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">repo ↗</a> : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleApprove(s.id, 'approved')}
                      disabled={reviewSubmission.isPending || s.status === 'approved'}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      onClick={() => toggleApprove(s.id, 'rejected')}
                      disabled={reviewSubmission.isPending || s.status === 'rejected'}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40 transition-colors"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                    <button
                      onClick={() => toggleFeatured(s.id, s.isFeatured)}
                      disabled={reviewSubmission.isPending || s.status !== 'approved'}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 transition-colors"
                    >
                      {s.isFeatured ? <><StarOff size={13} /> Unfeature</> : <><Star size={13} /> Feature</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Create Modal */}
      <ChallengeFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isSubmitting={createChallenge.isPending}
        mode="create"
      />

      {/* Edit Modal */}
      <ChallengeFormModal
        open={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingChallenge(null); }}
        initialData={editingChallenge || undefined}
        onSubmit={handleEdit}
        isSubmitting={updateChallenge.isPending}
        mode="edit"
      />
    </div>
  );
}
