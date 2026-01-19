'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Website } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useBookmarks } from '@/lib/store';
import { HeartIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface WebsiteCardProps {
  website: Website;
  showCreator?: boolean;
}

export default function WebsiteCard({ website, showCreator = true }: WebsiteCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(website.id);

  // Removed lowestPrice calculation


  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="group relative"
    >
      <Link href={`/website/${website.slug}`} className="block h-full">
        <div className="card h-full flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden transition-colors hover:border-brand-blue/50 shadow-sm hover:shadow-lg">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
            {website.thumbnail ? (
              <Image
                src={website.thumbnail}
                alt={website.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xl font-medium">
                {website.name.charAt(0)}
              </div>
            )}

            {website.hasFreeTrial && (
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-xs font-medium rounded-full shadow-sm z-10">
                Free Trial
              </span>
            )}

            {/* Overlay Gradient on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {website.category.name}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                <span>★</span>
                <span className="text-gray-700">{website.rating.toFixed(1)}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {website.name}
            </h3>

            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
              {website.description}
            </p>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
              {showCreator ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {website.creator.name.charAt(0)}
                  </div>
                  <span className="text-xs text-gray-600 truncate max-w-[100px]">
                    {website.creator.name}
                  </span>
                </div>
              ) : <div />}

              <div className="text-right">
                <span className="text-xs text-blue-600 font-medium group-hover:underline">View Tool →</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Bookmark Button - Absolute positioning for better hit area */}
      <button
        className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm transition-all hover:scale-110 active:scale-95 ${bookmarked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleBookmark(website);
        }}
        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <HeartIcon size={18} fill={bookmarked ? "currentColor" : "none"} />
      </button>
    </motion.div>
  );
}
