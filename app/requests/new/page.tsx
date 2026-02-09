'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { useCreateToolRequest } from '@/lib/api/tool-requests';
import { useCategories } from '@/lib/api/categories';
import { useAuth, useToast } from '@/lib/store';
import { ArrowLeft, Sparkles } from 'lucide-react';

function clampNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (Number.isNaN(n)) return undefined;
  return Math.max(0, n);
}

function errorMessage(err: unknown) {
  let msg = 'Failed to post request.';
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      const errorObj = record.error;
      const nested = errorObj && typeof errorObj === 'object' ? (errorObj as Record<string, unknown>).message : undefined;
      const top = record.message;
      const maybe = nested ?? top;
      if (typeof maybe === 'string' && maybe.trim()) msg = maybe;
    }
  } else if (err instanceof Error && err.message) {
    msg = err.message;
  }
  return msg;
}

export default function NewRequestPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();
  const { data: categories } = useCategories();
  const createRequest = useCreateToolRequest();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>(
    {}
  );

  const canSubmit = useMemo(() => {
    if (!title.trim() || !description.trim()) return false;
    return true;
  }, [title, description]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'buyer') {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-semibold w-fit mb-3">
          <Sparkles size={12} className="text-yellow-300" aria-hidden="true" />
          Request a Tool
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Post a request</h1>
        <p className="text-gray-600 mt-2 max-w-md">
          You need a buyer account to post requests. Creators can still browse and respond.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent('/requests/new')}`}
          className="mt-6 px-5 py-2.5 bg-black text-white rounded-xl font-semibold"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <Link href="/requests" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} />
          Back to Requests
        </Link>

        <div className="mt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-semibold w-fit mb-3">
            <Sparkles size={12} className="text-yellow-300" aria-hidden="true" />
            Request a Tool
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">What do you need?</h1>
          <p className="text-gray-600 mt-2">
            Be specific about the outcome. The better your request, the better the responses.
          </p>
        </div>

        <form
          className="mt-10 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();

            const nextErrors: typeof errors = {};
            if (title.trim().length < 8) nextErrors.title = 'Title must be at least 8 characters.';
            if (description.trim().length < 60) nextErrors.description = 'Description must be at least 60 characters.';
            setErrors(nextErrors);
            if (Object.keys(nextErrors).length > 0) return;

            createRequest.mutate(
              {
                title: title.trim(),
                description: description.trim(),
                ...(categoryId ? { categoryId } : {}),
                ...(clampNumber(budgetMin) !== undefined ? { budgetMin: clampNumber(budgetMin) } : {}),
                ...(clampNumber(budgetMax) !== undefined ? { budgetMax: clampNumber(budgetMax) } : {}),
                currency: 'IDR',
              },
              {
                onSuccess: (req) => {
                  showToast('Request posted. Creators will respond soon.', 'success');
                  router.push(`/requests/${req.id}`);
                },
                onError: (err: unknown) => {
                  showToast(errorMessage(err), 'error');
                },
              }
            );
          }}
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <label className="text-sm font-semibold text-gray-900">Title</label>
            <p className="text-sm text-gray-500 mt-1">
              One sentence describing the tool you want.
            </p>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
              }}
              placeholder="e.g. I need a landing page builder for AI SaaS"
              className={`mt-3 w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black/10 ${
                errors.title ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">{title.trim().length}/120</p>
              {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <label className="text-sm font-semibold text-gray-900">Category (optional)</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-3 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="">No category</option>
              {(categories || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <label className="text-sm font-semibold text-gray-900">Budget (optional)</label>
            <p className="text-sm text-gray-500 mt-1">Even a rough range helps creators qualify.</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Min (IDR)</label>
                <input
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 500000"
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Max (IDR)</label>
                <input
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 2000000"
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <label className="text-sm font-semibold text-gray-900">Description</label>
            <p className="text-sm text-gray-500 mt-1">
              Include target users, must-have features, and any examples. You can paste links.
            </p>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((p) => ({ ...p, description: undefined }));
              }}
              placeholder={
                "- Goal: ...\n- Must-have: ...\n- Nice-to-have: ...\n- Examples: ...\n- Timeline: ..."
              }
              className={`mt-3 w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black/10 min-h-[220px] ${
                errors.description ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">{description.trim().length}/4000</p>
              {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || createRequest.isPending}
            className="w-full px-6 py-3.5 rounded-2xl bg-black text-white font-semibold disabled:opacity-40 hover:bg-gray-800"
          >
            {createRequest.isPending ? 'Posting...' : 'Post request'}
          </button>
        </form>
      </div>
    </div>
  );
}
