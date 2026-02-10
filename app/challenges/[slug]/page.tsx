'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useChallengeBySlug, useCreateChallengeSubmission, useMyChallengeSubmission, useUpdateChallengeSubmission } from '@/lib/api/challenges';
import { useEffect, useRef, useState } from 'react';
import WebsiteCard from '@/components/WebsiteCard';

export default function ChallengeDetailPage() {
  const params = useParams();
  const slug = String(params?.slug || '');
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data, isLoading, error } = useChallengeBySlug(slug);
  const challenge = data?.challenge;
  const submissions = data?.submissions || [];

  const isCreator = isAuthenticated && user?.role === 'creator';
  const mySubmissionQuery = useMyChallengeSubmission(slug, { enabled: isCreator && !authLoading });
  const mySubmission = mySubmissionQuery.data;

  const createSubmission = useCreateChallengeSubmission();
  const updateSubmission = useUpdateChallengeSubmission();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [websiteSlug, setWebsiteSlug] = useState('');

  const hydratedFromExisting = useRef(false);
  useEffect(() => {
    if (!mySubmission) return;
    if (hydratedFromExisting.current) return;

    setTitle(mySubmission.title || '');
    setDescription(mySubmission.description || '');
    setDemoUrl(mySubmission.demoUrl || '');
    setRepoUrl(mySubmission.repoUrl || '');
    setWebsiteSlug(mySubmission.website?.slug || '');
    hydratedFromExisting.current = true;
  }, [mySubmission]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    if (mySubmission) {
      await updateSubmission.mutateAsync({
        id: mySubmission.id,
        slug,
        title,
        description,
        demoUrl,
        repoUrl: repoUrl || undefined,
        websiteSlug: websiteSlug || undefined,
      });
      return;
    }

    await createSubmission.mutateAsync({
      slug,
      title,
      description,
      demoUrl,
      repoUrl: repoUrl || undefined,
      websiteSlug: websiteSlug || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50">
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-32 pb-10">
        <Link href="/challenges" className="text-sm text-gray-600 hover:text-gray-900">← Back to Challenges</Link>

        {isLoading ? (
          <div className="mt-6 h-28 rounded-2xl bg-gray-100 animate-pulse" />
        ) : error || !challenge ? (
          <div className="mt-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
            Challenge not found.
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 sm:px-10 py-10 sm:py-12">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                    challenge.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : challenge.status === 'upcoming'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {challenge.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(challenge.startAt).toLocaleString()} – {new Date(challenge.endAt).toLocaleString()}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">{challenge.title}</h1>
                {challenge.theme ? (
                  <p className="mt-3 text-gray-600">Theme: <span className="font-medium text-gray-900">{challenge.theme}</span></p>
                ) : null}

                {challenge.rules ? (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold text-gray-900">Rules</h2>
                    <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{challenge.rules}</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Creator submission */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900">Approved submissions</h2>
                <p className="mt-1 text-sm text-gray-600">Featured builds are pinned first.</p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {submissions.length === 0 ? (
                    <div className="sm:col-span-2 p-6 rounded-2xl border border-gray-200 bg-white text-gray-600">
                      No approved submissions yet.
                    </div>
                  ) : (
                    submissions.map((s) => (
                      <div key={s.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            {s.isFeatured ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                Featured
                              </span>
                            ) : null}
                            <h3 className="mt-2 text-base font-semibold text-gray-900">{s.title}</h3>
                            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{s.description}</p>
                          </div>
                          <a
                            href={s.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Demo →
                          </a>
                        </div>

                        {s.website ? (
                          <div className="mt-4">
                            {/* Reuse listing card */}
                            {/* WebsiteCard expects full Website type; API returns subset so rely on existing usage */}
                            <WebsiteCard website={s.website as any} showCreator={false} />
                          </div>
                        ) : null}

                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                          <span>{s.user?.name ? `by ${s.user.name}` : ''}</span>
                          {s.repoUrl ? (
                            <a href={s.repoUrl} target="_blank" rel="noreferrer" className="hover:text-gray-800">
                              Repo
                            </a>
                          ) : <span />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h2 className="text-base font-semibold text-gray-900">Submit your entry</h2>
                  {!isCreator ? (
                    <p className="mt-2 text-sm text-gray-600">Creators can submit entries. Log in as a creator to participate.</p>
                  ) : (
                    <>
                      {mySubmission ? (
                        <div className="mt-3 text-xs text-gray-600">
                          Status: <span className="font-semibold text-gray-900">{mySubmission.status}</span>
                          {mySubmission.adminNote ? (
                            <p className="mt-2 text-xs text-gray-500">Admin note: {mySubmission.adminNote}</p>
                          ) : null}
                        </div>
                      ) : null}

                      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
                        <div>
                          <label className="text-xs font-semibold text-gray-700">Title</label>
                          <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="A short name for your build"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700">Description</label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[120px]"
                            placeholder="What did you build and who is it for?"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700">Demo URL</label>
                          <input
                            value={demoUrl}
                            onChange={(e) => setDemoUrl(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="https://..."
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700">Repo URL (optional)</label>
                          <input
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="https://github.com/..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700">Attach listing (optional)</label>
                          <input
                            value={websiteSlug}
                            onChange={(e) => setWebsiteSlug(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="website slug"
                          />
                          <p className="mt-1 text-xs text-gray-500">Only your own listings can be attached.</p>
                        </div>
                        <button
                          type="submit"
                          disabled={createSubmission.isPending || updateSubmission.isPending}
                          className="w-full mt-2 rounded-full bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
                        >
                          {mySubmission ? 'Update submission' : 'Submit entry'}
                        </button>
                        {(createSubmission.error || updateSubmission.error) ? (
                          <p className="text-xs text-red-600">
                            Failed to submit. Please check your inputs or challenge window.
                          </p>
                        ) : null}
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
