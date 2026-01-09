'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import WebsiteCard from '@/components/WebsiteCard';
import { WebsiteCardSkeleton } from '@/components/Skeleton';
import EmptyState, { EmptySearchIcon } from '@/components/EmptyState';
import { mockWebsites, mockCategories } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';

type SortOption = 'newest' | 'rating' | 'alphabetical' | 'popular';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const queryParam = searchParams.get('q') || '';

    const [query, setQuery] = useState(queryParam);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('rating');
    const [hasFreeTrial, setHasFreeTrial] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
    const [loading] = useState(false);

    // Filter and sort websites
    const filteredWebsites = useMemo(() => {
        let results = [...mockWebsites];

        // Search query
        if (query) {
            const q = query.toLowerCase();
            results = results.filter(
                (w) =>
                    w.name.toLowerCase().includes(q) ||
                    w.shortDescription.toLowerCase().includes(q) ||
                    w.category.name.toLowerCase().includes(q) ||
                    w.techStack.some((t) => t.toLowerCase().includes(q))
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            results = results.filter((w) => w.category.slug === selectedCategory);
        }

        // Free trial filter
        if (hasFreeTrial) {
            results = results.filter((w) => w.hasFreeTrial);
        }

        // Price range filter
        results = results.filter((w) => {
            const lowestPrice = Math.min(...w.pricing.map((p) => p.price));
            return lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];
        });

        // Sort
        results.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'rating':
                    return b.rating - a.rating;
                case 'alphabetical':
                    return a.name.localeCompare(b.name);
                case 'popular':
                    return b.viewCount - a.viewCount;
                default:
                    return 0;
            }
        });

        return results;
    }, [query, selectedCategory, sortBy, hasFreeTrial, priceRange]);

    return (
        <div className="search-page">
            <div className="container">
                <div className="search-layout">
                    {/* Sidebar Filters */}
                    <aside className="filters-sidebar">
                        <div className="filter-section">
                            <h3 className="filter-title">Categories</h3>
                            <div className="filter-options">
                                <label className="filter-option">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={selectedCategory === 'all'}
                                        onChange={() => setSelectedCategory('all')}
                                    />
                                    <span>All Categories</span>
                                    <span className="option-count">{mockWebsites.length}</span>
                                </label>
                                {mockCategories.map((cat) => (
                                    <label key={cat.id} className="filter-option">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat.slug}
                                            onChange={() => setSelectedCategory(cat.slug)}
                                        />
                                        <span>{cat.name}</span>
                                        <span className="option-count">
                                            {mockWebsites.filter((w) => w.categoryId === cat.id).length}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Price Range</h3>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    className="price-input"
                                    placeholder="Min"
                                    value={priceRange[0] || ''}
                                    onChange={(e) =>
                                        setPriceRange([Number(e.target.value) || 0, priceRange[1]])
                                    }
                                />
                                <span className="price-separator">—</span>
                                <input
                                    type="number"
                                    className="price-input"
                                    placeholder="Max"
                                    value={priceRange[1] || ''}
                                    onChange={(e) =>
                                        setPriceRange([priceRange[0], Number(e.target.value) || 5000000])
                                    }
                                />
                            </div>
                            <div className="price-presets">
                                <button
                                    className="preset-btn"
                                    onClick={() => setPriceRange([0, 500000])}
                                >
                                    Under {formatPrice(500000)}
                                </button>
                                <button
                                    className="preset-btn"
                                    onClick={() => setPriceRange([0, 1000000])}
                                >
                                    Under {formatPrice(1000000)}
                                </button>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Features</h3>
                            <label className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={hasFreeTrial}
                                    onChange={(e) => setHasFreeTrial(e.target.checked)}
                                />
                                <span>Free Trial Available</span>
                            </label>
                        </div>

                        <button
                            className="clear-filters"
                            onClick={() => {
                                setSelectedCategory('all');
                                setHasFreeTrial(false);
                                setPriceRange([0, 5000000]);
                            }}
                        >
                            Clear All Filters
                        </button>
                    </aside>

                    {/* Main Content */}
                    <main className="search-main">
                        {/* Search Bar */}
                        <div className="search-bar-wrapper">
                            <div className="search-bar">
                                <SearchIcon />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search for tools, categories, or technologies..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                {query && (
                                    <button className="clear-search" onClick={() => setQuery('')}>
                                        <CloseIcon />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Header */}
                        <div className="results-header">
                            <div className="results-count">
                                <strong>{filteredWebsites.length}</strong> websites found
                                {query && <span className="query-label"> for "{query}"</span>}
                            </div>
                            <div className="sort-controls">
                                <label className="sort-label">Sort by:</label>
                                <select
                                    className="sort-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                >
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Newest</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="alphabetical">A-Z</option>
                                </select>
                            </div>
                        </div>

                        {/* Results Grid */}
                        {loading ? (
                            <div className="results-grid">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <WebsiteCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : filteredWebsites.length > 0 ? (
                            <div className="results-grid">
                                {filteredWebsites.map((website) => (
                                    <WebsiteCard key={website.id} website={website} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<EmptySearchIcon />}
                                title="No websites found"
                                description="Try adjusting your search or filters to find what you're looking for."
                                action={
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setQuery('');
                                            setSelectedCategory('all');
                                            setHasFreeTrial(false);
                                            setPriceRange([0, 5000000]);
                                        }}
                                    >
                                        Clear all filters
                                    </button>
                                }
                            />
                        )}
                    </main>
                </div>
            </div>

            <style jsx>{`
        .search-page {
          padding: var(--space-8) 0;
          min-height: calc(100vh - 200px);
        }
        
        .search-layout {
          display: grid;
          gap: var(--space-8);
        }
        
        @media (min-width: 1024px) {
          .search-layout {
            grid-template-columns: 280px 1fr;
          }
        }
        
        /* Sidebar */
        .filters-sidebar {
          display: none;
        }
        
        @media (min-width: 1024px) {
          .filters-sidebar {
            display: block;
            position: sticky;
            top: 88px;
            height: fit-content;
          }
        }
        
        .filter-section {
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .filter-title {
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--gray-500);
          margin-bottom: var(--space-3);
        }
        
        .filter-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        
        .filter-option {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.9375rem;
          cursor: pointer;
          padding: var(--space-1) 0;
        }
        
        .filter-option input {
          width: 16px;
          height: 16px;
          accent-color: var(--foreground);
        }
        
        .option-count {
          margin-left: auto;
          font-size: 0.75rem;
          color: var(--gray-400);
        }
        
        .price-inputs {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .price-input {
          flex: 1;
          padding: var(--space-2) var(--space-3);
          font-size: 0.875rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-md);
        }
        
        .price-separator {
          color: var(--gray-400);
        }
        
        .price-presets {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-3);
        }
        
        .preset-btn {
          flex: 1;
          padding: var(--space-2);
          font-size: 0.75rem;
          background: var(--gray-100);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        
        .preset-btn:hover {
          background: var(--gray-200);
        }
        
        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.9375rem;
          cursor: pointer;
        }
        
        .filter-checkbox input {
          width: 16px;
          height: 16px;
          accent-color: var(--foreground);
        }
        
        .clear-filters {
          width: 100%;
          padding: var(--space-2);
          font-size: 0.8125rem;
          color: var(--gray-500);
          background: none;
          border: none;
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        
        .clear-filters:hover {
          color: var(--foreground);
        }
        
        /* Main Content */
        .search-main {
          min-width: 0;
        }
        
        .search-bar-wrapper {
          margin-bottom: var(--space-6);
        }
        
        .search-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }
        
        .search-bar:focus-within {
          border-color: var(--foreground);
          background: var(--background);
        }
        
        .search-input {
          flex: 1;
          font-size: 1rem;
          background: transparent;
          border: none;
          outline: none;
        }
        
        .clear-search {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--gray-200);
          border: none;
          border-radius: var(--radius-full);
          cursor: pointer;
          color: var(--gray-500);
          transition: all var(--transition-fast);
        }
        
        .clear-search:hover {
          background: var(--gray-300);
          color: var(--foreground);
        }
        
        .results-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
        }
        
        @media (min-width: 640px) {
          .results-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        
        .results-count {
          font-size: 0.9375rem;
          color: var(--gray-600);
        }
        
        .query-label {
          color: var(--foreground);
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
        
        .results-grid {
          display: grid;
          gap: var(--space-6);
          grid-template-columns: repeat(1, 1fr);
        }
        
        @media (min-width: 640px) {
          .results-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (min-width: 1280px) {
          .results-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
        </div>
    );
}

function SearchIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}
