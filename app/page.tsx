'use client';

import { useState } from 'react';
import Link from 'next/link';
import WebsiteCard from '@/components/WebsiteCard';
import { WebsiteCardSkeleton } from '@/components/Skeleton';
import { mockWebsites, mockCategories } from '@/lib/mockData';

type SortOption = 'newest' | 'rating' | 'alphabetical';

export default function HomePage() {
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [loading] = useState(false);

  // Sort websites
  const sortedWebsites = [...mockWebsites].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Discover Hidden Gem
              <br />
              <span className="hero-accent">Websites</span>
            </h1>
            <p className="hero-subtitle">
              A curated marketplace for service-based websites built by independent creators
              and AI-enabled developers. Find tools that solve real problems.
            </p>
            <div className="hero-search">
              <Link href="/search" className="search-box">
                <SearchIcon />
                <span>Search for productivity tools, AI assistants, and more...</span>
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">150+</span>
                <span className="stat-label">Websites</span>
              </div>
              <div className="stat">
                <span className="stat-value">40+</span>
                <span className="stat-label">Creators</span>
              </div>
              <div className="stat">
                <span className="stat-value">1,200+</span>
                <span className="stat-label">Happy Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <div className="categories-grid">
            {mockCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="category-card"
              >
                <CategoryIcon slug={category.slug} />
                <span className="category-name">{category.name}</span>
                <span className="category-count">{category.websiteCount} websites</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="listings-section">
        <div className="container">
          <div className="listings-header">
            <h2 className="section-title">Explore Websites</h2>
            <div className="sort-controls">
              <label className="sort-label">Sort by:</label>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>

          <div className="listings-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                <WebsiteCardSkeleton key={i} />
              ))
              : sortedWebsites.map((website) => (
                <WebsiteCard key={website.id} website={website} />
              ))}
          </div>

          <div className="listings-footer">
            <Link href="/search" className="view-all-btn">
              View All Websites
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Are you a creator?</h2>
            <p className="cta-text">
              Join our curated marketplace and reach users looking for exactly what you've built.
              No listing fees, just a small platform fee per transaction.
            </p>
            <Link href="/signup?role=creator" className="cta-button">
              Apply as Creator
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
        }
        
        /* Hero */
        .hero {
          padding: var(--space-16) 0 var(--space-12);
          background: linear-gradient(180deg, var(--gray-50) 0%, var(--background) 100%);
        }
        
        .hero-content {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }
        
        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }
        
        @media (min-width: 768px) {
          .hero-title {
            font-size: 3.5rem;
          }
        }
        
        .hero-accent {
          background: linear-gradient(135deg, var(--foreground) 0%, var(--gray-600) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          margin-top: var(--space-4);
          font-size: 1.125rem;
          color: var(--gray-600);
          max-width: 540px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .hero-search {
          margin-top: var(--space-8);
        }
        
        .search-box {
          display: inline-flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-6);
          background: var(--background);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-full);
          color: var(--gray-500);
          font-size: 0.9375rem;
          box-shadow: var(--shadow-md);
          transition: all var(--transition-fast);
          max-width: 100%;
          width: 500px;
        }
        
        .search-box:hover {
          border-color: var(--gray-300);
          box-shadow: var(--shadow-lg);
          color: var(--gray-600);
        }
        
        .hero-stats {
          display: flex;
          justify-content: center;
          gap: var(--space-8);
          margin-top: var(--space-10);
        }
        
        .stat {
          text-align: center;
        }
        
        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
        }
        
        .stat-label {
          font-size: 0.8125rem;
          color: var(--gray-500);
        }
        
        /* Categories */
        .categories-section {
          padding: var(--space-12) 0;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: var(--space-6);
        }
        
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }
        
        @media (min-width: 640px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          .categories-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }
        
        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-6) var(--space-4);
          background: var(--background);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          text-align: center;
          transition: all var(--transition-fast);
        }
        
        .category-card:hover {
          border-color: var(--foreground);
          transform: translateY(-2px);
          color: var(--foreground);
        }
        
        .category-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--foreground);
        }
        
        .category-count {
          font-size: 0.75rem;
          color: var(--gray-500);
        }
        
        /* Listings */
        .listings-section {
          padding: var(--space-12) 0;
          background: var(--gray-50);
        }
        
        .listings-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        
        @media (min-width: 640px) {
          .listings-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        
        .sort-controls {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .sort-label {
          font-size: 0.875rem;
          color: var(--gray-600);
        }
        
        .sort-select {
          padding: var(--space-2) var(--space-3);
          font-size: 0.875rem;
          background: var(--background);
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-md);
          cursor: pointer;
        }
        
        .listings-grid {
          display: grid;
          gap: var(--space-6);
          grid-template-columns: repeat(1, 1fr);
        }
        
        @media (min-width: 640px) {
          .listings-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (min-width: 1024px) {
          .listings-grid { grid-template-columns: repeat(3, 1fr); }
        }
        
        @media (min-width: 1280px) {
          .listings-grid { grid-template-columns: repeat(4, 1fr); }
        }
        
        .listings-footer {
          margin-top: var(--space-8);
          text-align: center;
        }
        
        .view-all-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-6);
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--foreground);
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
        }
        
        .view-all-btn:hover {
          background: var(--foreground);
          color: var(--background);
          border-color: var(--foreground);
        }
        
        /* CTA */
        .cta-section {
          padding: var(--space-16) 0;
        }
        
        .cta-content {
          max-width: 560px;
          margin: 0 auto;
          text-align: center;
          padding: var(--space-10);
          background: var(--foreground);
          color: var(--background);
          border-radius: var(--radius-xl);
        }
        
        .cta-title {
          font-size: 1.75rem;
          font-weight: 600;
        }
        
        .cta-text {
          margin-top: var(--space-3);
          font-size: 0.9375rem;
          opacity: 0.8;
        }
        
        .cta-button {
          display: inline-block;
          margin-top: var(--space-6);
          padding: var(--space-3) var(--space-6);
          background: var(--background);
          color: var(--foreground);
          font-weight: 500;
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
        }
        
        .cta-button:hover {
          opacity: 0.9;
          transform: scale(1.02);
          color: var(--foreground);
        }
      `}</style>
    </div>
  );
}

// Icons
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CategoryIcon({ slug }: { slug: string }) {
  const icons: Record<string, React.ReactNode> = {
    productivity: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    administration: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    education: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
      </svg>
    ),
    entertainment: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
      </svg>
    ),
    finance: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    'ai-tools': (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" />
        <circle cx="7.5" cy="14.5" r="1.5" fill="currentColor" />
        <circle cx="16.5" cy="14.5" r="1.5" fill="currentColor" />
      </svg>
    ),
  };

  return icons[slug] || icons.productivity;
}
