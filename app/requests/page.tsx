'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useToolRequests } from '@/lib/api/tool-requests';
import { useCategories } from '@/lib/api/categories';
import ToolRequestCard from '@/components/ToolRequestCard';
import { Plus, Search, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/store';

export default function RequestsPage() {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<'open' | 'closed'>('open');
  const [sortBy, setSortBy] = useState<'newest' | 'recent_activity'>('recent_activity');

  const { data: categories } = useCategories();
  const { data, isLoading, error } = useToolRequests({
    status,
    search: search.trim() || undefined,
    category: category || undefined,
    sortBy,
    page: 1,
    limit: 30,
  });

  const items = data?.requests || [];
  const canPost = isAuthenticated && user?.role === 'buyer';

  const headerCopy = useMemo(() => {
    if (!isAuthenticated) return 'Post what you need. Creators will respond with solutions.';
    if (user?.role === 'creator') return 'Browse open requests and respond with your best solution.';
    if (user?.role === 'buyer') return 'Post what you need and get proposals from creators.';
    return 'Post what you need. Creators will respond with solutions.';
  }, [isAuthenticated, user?.role]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-semibold w-fit mb-3">
              <Sparkles size={12} className="text-yellow-300" aria-hidden="true" />
              Request a Tool
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Requests</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">{headerCopy}</p>
          </div>

          <div className="flex items-center gap-3">
            {canPost ? (
              <Link
                href="/requests/new"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800"
              >
                <Plus size={18} />
                Post a request
              </Link>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent('/requests/new')}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800"
              >
                <Plus size={18} />
                Post a request
              </Link>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-900">Filters</p>

              <div className="mt-4">
                <label className="text-xs font-semibold text-gray-600">Search</label>
                <div className="mt-2 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="e.g. landing page builder"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-gray-600">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="">All</option>
                  {(categories || []).map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'open' | 'closed')}
                    className="mt-2 w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Sort</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'recent_activity')}
                    className="mt-2 w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="recent_activity">Recent activity</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 text-xs text-gray-500">
                Tip: If you are a creator, respond with clarity and attach your listing for higher trust.
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500">Loading requests...</div>
            ) : error ? (
              <div className="p-10 text-center text-red-600">Failed to load requests.</div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-gray-50 border border-gray-200 rounded-2xl">
                No requests yet.
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((r) => (
                  <ToolRequestCard key={r.id} request={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
