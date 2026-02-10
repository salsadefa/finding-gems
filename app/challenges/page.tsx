'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trophy, ArrowRight, Calendar } from 'lucide-react';
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[16/9] bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              Failed to load challenges.
            </div>
          ) : challenges.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-gray-200 bg-white/50 backdrop-blur-sm shadow-sm">
              <div className="p-4 rounded-full bg-blue-50 text-blue-600 mb-4">
                <Trophy className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No active challenges</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                We&apos;re currently preparing the next big challenge. Check back soon or follow us for updates on when the next event drops.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((c) => (
                <Link
                  key={c.id}
                  href={`/challenges/${c.slug}`}
                  className="group relative rounded-3xl overflow-hidden border border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                >
                  {/* Cover image / fallback gradient */}
                  <div className="relative aspect-[16/9]">
                    {c.coverImage ? (
                      <Image
                        src={c.coverImage}
                        alt={c.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-50 to-amber-50" />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Content on top of image */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${
                          c.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30'
                            : c.status === 'upcoming'
                            ? 'bg-blue-500/20 text-blue-100 border-blue-400/30'
                            : 'bg-white/20 text-white/80 border-white/20'
                        }`}>
                          {c.status.toUpperCase()}
                        </span>
                        {c.theme ? (
                          <span className="text-xs text-white/80 backdrop-blur-sm bg-white/10 px-2 py-1 rounded-full">
                            {c.theme}
                          </span>
                        ) : null}
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-blue-200 transition-colors">
                        {c.title}
                      </h2>

                      <div className="flex items-center justify-between mt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-white/80">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(c.startAt).toLocaleDateString()} – {new Date(c.endAt).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90 group-hover:text-white transition-colors">
                          View challenge <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
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
