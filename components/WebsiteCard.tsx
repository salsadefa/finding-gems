'use client';

import Link from 'next/link';
import { Website } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useBookmarks } from '@/lib/store';
import Rating from './Rating';

interface WebsiteCardProps {
    website: Website;
    showCreator?: boolean;
}

export default function WebsiteCard({ website, showCreator = true }: WebsiteCardProps) {
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const bookmarked = isBookmarked(website.id);

    // Get the lowest price
    const lowestPrice = website.pricing.reduce(
        (min, p) => p.price < min ? p.price : min,
        website.pricing[0]?.price || 0
    );

    return (
        <article className="website-card">
            <Link href={`/website/${website.slug}`} className="card-link">
                {/* Thumbnail */}
                <div className="card-thumbnail">
                    <div className="thumbnail-placeholder">
                        <span>{website.name.charAt(0)}</span>
                    </div>
                    {website.hasFreeTrial && (
                        <span className="trial-badge">Free Trial</span>
                    )}
                </div>

                {/* Content */}
                <div className="card-content">
                    {/* Category */}
                    <span className="card-category">{website.category.name}</span>

                    {/* Title */}
                    <h3 className="card-title">{website.name}</h3>

                    {/* Description */}
                    <p className="card-description">{website.shortDescription}</p>

                    {/* Rating */}
                    <div className="card-rating">
                        <Rating value={website.rating} size="sm" />
                        <span className="rating-count">({website.reviewCount})</span>
                    </div>

                    {/* Footer */}
                    <div className="card-footer">
                        {showCreator && (
                            <div className="card-creator">
                                <div className="creator-avatar">
                                    {website.creator.name.charAt(0)}
                                </div>
                                <span className="creator-name">{website.creator.name}</span>
                            </div>
                        )}
                        <div className="card-price">
                            <span className="price-from">From</span>
                            <span className="price-value">{formatPrice(lowestPrice)}</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Bookmark Button */}
            <button
                className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(website);
                }}
                aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
                <HeartIcon filled={bookmarked} />
            </button>

            <style jsx>{`
        .website-card {
          position: relative;
          background: var(--background);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition-base);
        }
        
        .website-card:hover {
          border-color: var(--gray-300);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        
        .card-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        
        .card-thumbnail {
          position: relative;
          aspect-ratio: 16 / 10;
          background: var(--gray-100);
          overflow: hidden;
        }
        
        .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--gray-300);
          background: linear-gradient(135deg, var(--gray-100), var(--gray-200));
        }
        
        .trial-badge {
          position: absolute;
          top: var(--space-3);
          left: var(--space-3);
          padding: var(--space-1) var(--space-2);
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: var(--foreground);
          color: var(--background);
          border-radius: var(--radius-sm);
        }
        
        .card-content {
          padding: var(--space-4);
        }
        
        .card-category {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--gray-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .card-title {
          margin-top: var(--space-1);
          font-size: 1.0625rem;
          font-weight: 600;
          color: var(--foreground);
          line-height: 1.3;
        }
        
        .card-description {
          margin-top: var(--space-2);
          font-size: 0.8125rem;
          color: var(--gray-600);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .card-rating {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          margin-top: var(--space-3);
        }
        
        .rating-count {
          font-size: 0.75rem;
          color: var(--gray-500);
        }
        
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--gray-100);
        }
        
        .card-creator {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .creator-avatar {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          background: var(--gray-200);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--gray-600);
        }
        
        .creator-name {
          font-size: 0.8125rem;
          color: var(--gray-600);
        }
        
        .card-price {
          text-align: right;
        }
        
        .price-from {
          display: block;
          font-size: 0.6875rem;
          color: var(--gray-500);
        }
        
        .price-value {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--foreground);
        }
        
        .bookmark-btn {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background);
          border: none;
          border-radius: var(--radius-full);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
          opacity: 0;
        }
        
        .website-card:hover .bookmark-btn {
          opacity: 1;
        }
        
        .bookmark-btn:hover {
          transform: scale(1.1);
        }
        
        .bookmark-btn.bookmarked {
          opacity: 1;
          color: var(--foreground);
        }
      `}</style>
        </article>
    );
}

function HeartIcon({ filled }: { filled: boolean }) {
    return filled ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}
