'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDropBySlug } from '@/lib/api/drops';
import WebsiteCard from '@/components/WebsiteCard';
import type { Website } from '@/lib/types';
import { ArrowLeft, Sparkles } from 'lucide-react';

function toWebsite(w: Website): Website {
  return {
    ...w,
    description: w.description || w.shortDescription || w.name,
    shortDescription: w.shortDescription || w.description || w.name,
    updatedAt: w.updatedAt || w.createdAt,
  };
}

export default function DropDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const { data, isLoading, error } = useDropBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center text-gray-500">
        Loading drop...
      </div>
    );
  }

  if (error || !data?.drop) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 mb-4">
          <Sparkles />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Drop not found</h1>
        <p className="text-gray-500 mt-2">This drop may be unpublished or the link is incorrect.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-semibold">
          <ArrowLeft size={16} />
          Back home
        </Link>
      </div>
    );
  }

  const { drop, items } = data;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} />
          Home
        </Link>

        <div className="mt-5 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 w-fit">
            <Sparkles size={14} />
            Weekly Drop
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">{drop.title}</h1>
          {drop.description && <p className="text-gray-600 text-lg max-w-3xl">{drop.description}</p>}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.id} className="space-y-3">
              {it.note && (
                <div className="text-sm text-gray-700 bg-amber-50/40 border border-amber-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">Why it made the drop</p>
                  <p className="text-gray-700">{it.note}</p>
                </div>
              )}
              <WebsiteCard website={toWebsite(it.website)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
