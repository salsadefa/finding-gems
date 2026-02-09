'use client';

import { useMemo, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, EyeOff, Eye, RefreshCw } from 'lucide-react';

type ToolRequestAdmin = {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed';
  isHidden: boolean;
  hiddenReason: string | null;
  responseCount: number;
  createdAt: string;
  buyer?: { id: string; name: string; username: string; email: string } | null;
  category?: { id: string; name: string; slug: string } | null;
};

type ApiEnvelope<T> = { success: boolean; data: T; timestamp?: string };

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

export default function RequestsTab() {
  const queryClient = useQueryClient();
  const [hidden, setHidden] = useState<'all' | 'true' | 'false'>('all');
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'tool-requests', { hidden, status }],
    queryFn: async () => {
      const params: Record<string, string> = { page: '1', limit: '50' };
      if (hidden !== 'all') params.hidden = hidden;
      if (status !== 'all') params.status = status;
      const resp = await apiClient.get<ApiEnvelope<{ requests: ToolRequestAdmin[] }>>('/admin/requests', { params });
      return resp.data.data.requests;
    },
    staleTime: 10 * 1000,
  });

  const items = useMemo(() => data ?? [], [data]);

  const hideReq = useMutation({
    mutationFn: async (payload: { id: string; reason?: string }) => {
      const resp = await apiClient.patch<ApiEnvelope<{ request: ToolRequestAdmin }>>(`/admin/requests/${payload.id}/hide`, {
        reason: payload.reason,
      });
      return resp.data.data.request;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tool-requests'] }),
  });

  const unhideReq = useMutation({
    mutationFn: async (id: string) => {
      const resp = await apiClient.patch<ApiEnvelope<{ request: ToolRequestAdmin }>>(`/admin/requests/${id}/unhide`, {});
      return resp.data.data.request;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tool-requests'] }),
  });

  const [reasonDraft, setReasonDraft] = useState<Record<string, string>>({});

  const header = useMemo(() => {
    const total = items.length;
    const hiddenCount = items.filter((r) => r.isHidden).length;
    return { total, hiddenCount };
  }, [items]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">Tool Requests Moderation</h2>
          <p className="text-sm text-gray-500 mt-1">
            {header.total} loaded, {header.hiddenCount} hidden.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={hidden}
            onChange={(e) => setHidden(e.target.value as 'all' | 'true' | 'false')}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="false">Visible</option>
            <option value="true">Hidden</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | 'open' | 'closed')}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-gray-500">Loading requests...</div>
      ) : error ? (
        <div className="p-10 text-center text-red-600">Failed to load requests.</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-700">
            <Shield />
          </div>
          No requests found.
        </div>
      ) : (
        <div className="divide-y">
          {items.map((r) => (
            <div key={r.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>{r.status.toUpperCase()}</span>
                    <span>•</span>
                    <span>{r.responseCount} responses</span>
                    <span>•</span>
                    <span>{timeAgo(r.createdAt)}</span>
                    {r.category?.name && (
                      <>
                        <span>•</span>
                        <span>{r.category.name}</span>
                      </>
                    )}
                    {r.buyer?.email && (
                      <>
                        <span>•</span>
                        <span className="truncate">{r.buyer.email}</span>
                      </>
                    )}
                  </div>
                  {r.isHidden && (
                    <p className="text-xs text-red-600 mt-2">
                      Hidden{r.hiddenReason ? `: ${r.hiddenReason}` : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.isHidden ? (
                    <button
                      onClick={() => unhideReq.mutate(r.id)}
                      disabled={unhideReq.isPending}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-40"
                    >
                      <Eye size={16} /> Unhide
                    </button>
                  ) : (
                    <button
                      onClick={() => hideReq.mutate({ id: r.id, reason: reasonDraft[r.id] || undefined })}
                      disabled={hideReq.isPending}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40"
                    >
                      <EyeOff size={16} /> Hide
                    </button>
                  )}
                </div>
              </div>

              {!r.isHidden && (
                <div className="mt-4">
                  <label className="text-xs font-semibold text-gray-600">Hide reason (optional)</label>
                  <input
                    value={reasonDraft[r.id] || ''}
                    onChange={(e) => setReasonDraft((p) => ({ ...p, [r.id]: e.target.value }))}
                    placeholder="e.g. spam / low quality / contains phishing link"
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
