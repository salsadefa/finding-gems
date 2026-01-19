'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import WebsiteCard from '@/components/WebsiteCard';
import { WebsiteCardSkeleton } from '@/components/Skeleton';
import EmptyState, { EmptySearchIcon } from '@/components/EmptyState';
import { mockWebsites, mockCategories } from '@/lib/mockData';
import { Search, SlidersHorizontal, ChevronDown, Check, ChevronUp } from 'lucide-react';

type SortOption = 'newest' | 'rating' | 'alphabetical' | 'popular';

function SearchContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  // Read category from URL
  const categoryParam = searchParams.get('category');
  // Initialize state from URL
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [hasFreeTrial, setHasFreeTrial] = useState(false);
  const [loading] = useState(false);

  // Sync URL changes to state
  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCategory) {
      // eslint-disable-next-line
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam, selectedCategory]);

  // Collapsible sections state
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(true);

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
  }, [query, selectedCategory, sortBy, hasFreeTrial]);

  return (
    <div className="min-h-screen bg-white">
      {/* 
        Sticky Sub-Header (Behance Style) 
        Top position accounts for the main floating navbar (~80px approx + spacing)
      */}
      <div className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 mb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Left: Filter Toggle (Visual only for now on desktop, could toggle sidebar on mobile) */}
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>

            {/* Middle: Wide Search Bar */}
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for tools, creative assets, or inspiration..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm font-medium text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Right: Sort Dropdown */}
            <div className="relative min-w-[180px]">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 cursor-pointer transition-all"
              >
                <option value="rating">Recommended</option>
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 sm:px-6 pb-20 pt-4">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-10">

            {/* Categories Section */}
            <div className="border-b border-gray-100 pb-8">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between mb-4 group"
              >
                <h3 className="font-bold text-gray-900 text-sm tracking-wide">CATEGORIES</h3>
                {isCategoryOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {isCategoryOpen && (
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === 'all' ? 'bg-black border-black' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                      {selectedCategory === 'all' && <Check size={12} className="text-white" />}
                    </div>
                    <input
                      type="radio"
                      name="category"
                      className="hidden"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                    />
                    <span className={`text-sm ${selectedCategory === 'all' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>All Categories</span>
                    <span className="ml-auto text-xs text-gray-400">{mockWebsites.length}</span>
                  </label>

                  {mockCategories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat.slug ? 'bg-black border-black' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                        {selectedCategory === cat.slug && <Check size={12} className="text-white" />}
                      </div>
                      <input
                        type="radio"
                        name="category"
                        className="hidden"
                        checked={selectedCategory === cat.slug}
                        onChange={() => setSelectedCategory(cat.slug)}
                      />
                      <span className={`text-sm ${selectedCategory === cat.slug ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{cat.name}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        {mockWebsites.filter((w) => w.categoryId === cat.id).length}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price section removed */}


            {/* Features Section */}
            <div>
              <button
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="font-bold text-gray-900 text-sm tracking-wide">FEATURES</h3>
                {isFeaturesOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {isFeaturesOpen && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasFreeTrial ? 'bg-black border-black' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                    {hasFreeTrial && <Check size={12} className="text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={hasFreeTrial}
                    onChange={(e) => setHasFreeTrial(e.target.checked)}
                  />
                  <span className={`text-sm ${hasFreeTrial ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>Free Trial Available</span>
                </label>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedCategory('all');
                setHasFreeTrial(false);
              }}
              className="mt-6 w-full py-2 text-sm text-gray-400 hover:text-gray-900 transition-colors text-center"
            >
              Reset all filters
            </button>
          </aside>

          {/* Results Grid */}
          <main className="flex-1 min-w-0">
            {/* Results Count Header */}
            <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h1 className="text-lg font-medium text-gray-900">
                {filteredWebsites.length} Results
                {query && <span className="text-gray-500 font-normal ml-1">for &quot;{query}&quot;</span>}
              </h1>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <WebsiteCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredWebsites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredWebsites.map((website) => (
                  <WebsiteCard key={website.id} website={website} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<EmptySearchIcon />}
                title="No results found"
                description="We couldn't find any tools matching your criteria. Try adjusting your filters or search terms."
                action={
                  <button
                    className="mt-4 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all shadow-sm"
                    onClick={() => {
                      setQuery('');
                      setSelectedCategory('all');
                      setHasFreeTrial(false);
                    }}
                  >
                    Clear All Filters
                  </button>
                }
              />
            )}
          </main>

        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    // Add top padding to clear the fixed main navbar
    <div className="pt-24">
      <Suspense fallback={
        <div className="container mx-auto px-6 py-20 text-center text-gray-500">
          <p>Loading search...</p>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
