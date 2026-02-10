'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { useToolRequest, useCloseToolRequest, useCreateToolRequestResponse, useSolveToolRequest } from '@/lib/api/tool-requests';
import { useAuth, useToast } from '@/lib/store';
import { useCreateThread } from '@/lib/api/messages';
import { ArrowLeft, MessageSquare, Tag, Clock, ExternalLink } from 'lucide-react';
import { useMyWebsites } from '@/lib/api/websites';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function errorMessage(err: unknown, fallback: string) {
  let msg = fallback;
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

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const { data, isLoading, error } = useToolRequest(id);
  const closeRequest = useCloseToolRequest();
  const solveRequest = useSolveToolRequest();
  const respond = useCreateToolRequestResponse();
  const createThread = useCreateThread();
  const { data: myWebsites } = useMyWebsites();

  const request = data?.request;
  const responses = data?.responses || [];

  const isOwnerBuyer = Boolean(isAuthenticated && user?.role === 'buyer' && request?.buyer?.id === user.id);
  const canRespond = Boolean(isAuthenticated && user?.role === 'creator' && request?.status === 'open');
  const selectedResponseId = request?.selectedResponseId || null;
  const isSolved = Boolean(request?.solvedAt || selectedResponseId);

  const [message, setMessage] = useState('');
  const [websiteSlug, setWebsiteSlug] = useState('');

  const budget = useMemo(() => {
    if (!request) return null;
    if (!request.budgetMin && !request.budgetMax) return null;
    return `${request.currency} ${request.budgetMin ? request.budgetMin.toLocaleString() : '0'} - ${
      request.budgetMax ? request.budgetMax.toLocaleString() : 'Flexible'
    }`;
  }, [request]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center text-gray-500">
        Loading request...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-gray-900">Request not found</h1>
        <p className="text-gray-600 mt-2">This request may be closed, hidden, or the link is invalid.</p>
        <Link href="/requests" className="mt-6 px-5 py-2.5 bg-black text-white rounded-xl font-semibold">
          Back to Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <div className="flex items-center justify-between gap-4">
          <Link href="/requests" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} /> Back to Requests
          </Link>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold border ${
              request.status === 'open'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            {request.status === 'open' ? 'Open' : 'Closed'}
          </span>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
          <p className="text-gray-700 mt-3 whitespace-pre-wrap">{request.description}</p>

          <div className="mt-5 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Clock size={14} /> {timeAgo(request.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={14} /> {request.responseCount} responses
            </span>
            {request.category?.name && (
              <span className="inline-flex items-center gap-1">
                <Tag size={14} /> {request.category.name}
              </span>
            )}
            {budget && <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">{budget}</span>}
          </div>

          {isOwnerBuyer && request.status === 'open' && (
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => {
                  closeRequest.mutate(request.id, {
                    onSuccess: () => showToast('Request closed.', 'success'),
                    onError: (err: unknown) => showToast(errorMessage(err, 'Failed to close request.'), 'error'),
                  });
                }}
                disabled={closeRequest.isPending}
                className="px-4 py-2.5 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-40"
              >
                {closeRequest.isPending ? 'Closing...' : 'Close request'}
              </button>
              <p className="text-sm text-gray-500">Close it when you have enough options.</p>
            </div>
          )}

          {isOwnerBuyer && isSolved && (
            <div className="mt-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-sm text-emerald-800">
              This request is solved. Thanks for keeping the board clean.
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Responses</p>
              </div>
              {responses.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No responses yet.</div>
              ) : (
                <div className="divide-y">
                  {responses.map((r) => (
                    <div
                      key={r.id}
                      className={`p-5 ${selectedResponseId === r.id ? 'bg-emerald-50/40' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {r.responder?.name}{' '}
                            <span className="text-xs font-normal text-gray-500">@{r.responder?.username}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{timeAgo(r.createdAt)}</p>
                        </div>
                        {r.website?.slug && (
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/website/${r.website.slug}`}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                            >
                              View listing <ExternalLink size={16} />
                            </Link>
                            <Link
                              href={`/checkout?slug=${encodeURIComponent(r.website.slug)}`}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800"
                            >
                              Buy listing
                            </Link>
                          </div>
                        )}
                      </div>

                      {isOwnerBuyer && r.responder?.id && r.responder.id !== user?.id && (
                        <div className="mt-3">
                          <button
                            onClick={async () => {
                              try {
                                const threadId = await createThread.mutateAsync({
                                  otherUserId: r.responder.id,
                                  requestId: request.id,
                                });
                                window.location.href = `/dashboard/messages?thread=${encodeURIComponent(threadId)}`;
                              } catch (err) {
                                showToast(errorMessage(err, 'Failed to start conversation.'), 'error');
                              }
                            }}
                            disabled={createThread.isPending}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-40"
                          >
                            Message creator
                          </button>
                        </div>
                      )}

                      {isOwnerBuyer && request.status === 'open' && (
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            onClick={() => {
                              solveRequest.mutate(
                                { requestId: request.id, responseId: r.id },
                                {
                                  onSuccess: () => showToast('Request solved. Selected response saved.', 'success'),
                                  onError: (err: unknown) =>
                                    showToast(errorMessage(err, 'Failed to solve request.'), 'error'),
                                }
                              );
                            }}
                            disabled={solveRequest.isPending}
                            className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40"
                          >
                            Select this response
                          </button>
                          <p className="text-xs text-gray-500">This will close the request and mark it solved.</p>
                        </div>
                      )}

                      <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-900">Respond</p>
              {!isAuthenticated ? (
                <p className="text-sm text-gray-600 mt-2">Log in as a creator to respond.</p>
              ) : user?.role !== 'creator' ? (
                <p className="text-sm text-gray-600 mt-2">Only creators can respond to requests.</p>
              ) : request.status !== 'open' ? (
                <p className="text-sm text-gray-600 mt-2">This request is closed.</p>
              ) : (
                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!message.trim()) return;
                    respond.mutate(
                      { requestId: request.id, message: message.trim(), ...(websiteSlug ? { websiteSlug } : {}) },
                      {
                        onSuccess: () => {
                          showToast('Response sent.', 'success');
                          setMessage('');
                        },
                        onError: (err: unknown) => showToast(errorMessage(err, 'Failed to respond.'), 'error'),
                      }
                    );
                  }}
                >
                  <label className="text-xs font-semibold text-gray-600">Attach your listing (optional)</label>
                  <select
                    value={websiteSlug}
                    onChange={(e) => setWebsiteSlug(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="">No listing</option>
                    {(myWebsites || []).map((w) => (
                      <option key={w.id} value={w.slug}>
                        {w.name}
                      </option>
                    ))}
                  </select>

                  <label className="text-xs font-semibold text-gray-600">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Explain your approach, scope, timeline, and a clear next step."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/10 min-h-[160px]"
                  />
                  <button
                    type="submit"
                    disabled={!canRespond || respond.isPending || message.trim().length < 20}
                    className="w-full px-4 py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-40"
                  >
                    {respond.isPending ? 'Sending...' : 'Send response'}
                  </button>
                  <p className="text-xs text-gray-500">
                    Tip: include a short proposal + link to your best matching listing.
                  </p>
                </form>
              )}
            </div>

            {isOwnerBuyer && request.status === 'open' && responses.length > 0 && (
              <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">
                <p className="text-sm font-semibold text-gray-900">No perfect match?</p>
                <p className="text-sm text-gray-600 mt-2">
                  You can mark this request as solved without selecting a response.
                </p>
                <button
                  onClick={() => {
                    solveRequest.mutate(
                      { requestId: request.id },
                      {
                        onSuccess: () => showToast('Request marked as solved.', 'success'),
                        onError: (err: unknown) => showToast(errorMessage(err, 'Failed to solve request.'), 'error'),
                      }
                    );
                  }}
                  disabled={solveRequest.isPending}
                  className="mt-4 w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-40"
                >
                  Mark as solved
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
