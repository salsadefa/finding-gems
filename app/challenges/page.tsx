'use client';

import Link from 'next/link';
import { useChallenges } from '@/lib/api/challenges';

export default function ChallengesPage() {
  const { data, isLoading, error } = useChallenges({});
  const challenges = data?.challenges || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50">
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-32 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-500">Event</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">Vibe Code Challenge</h1>
            <p className="mt-3 text-gray-600 max-w-2xl">
              Timeboxed challenges to ship focused tools. Submit your build, get reviewed, and get featured.
            </p>
          </div>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              Failed to load challenges.
            </div>
          ) : challenges.length === 0 ? (
            <div className="p-8 rounded-2xl border border-gray-200 bg-white text-gray-600">
              No challenges yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((c) => (
                <Link
                  key={c.id}
                  href={`/challenges/${c.slug}`}
                  className="group p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                          c.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.status === 'upcoming'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {c.status.toUpperCase()}
                        </span>
                        {c.theme ? (
                          <span className="text-xs text-gray-500">Theme: {c.theme}</span>
                        ) : null}
                      </div>
                      <h2 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {c.title}
                      </h2>
                      <p className="mt-2 text-sm text-gray-600">
                        {new Date(c.startAt).toLocaleDateString()} – {new Date(c.endAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
