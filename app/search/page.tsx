'use client';

import { useState, useMemo, Suspense, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import WebsiteCard from '@/components/WebsiteCard';
import { WebsiteCardSkeleton } from '@/components/Skeleton';
import EmptyState, { EmptySearchIcon } from '@/components/EmptyState';
import { useWebsites } from '@/lib/api/websites';
import { useCategories } from '@/lib/api/categories';
import { Search, SlidersHorizontal, ChevronDown, Check, ChevronUp } from 'lucide-react';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

type SortOption = 'newest' | 'rating' | 'alphabetical' | 'popular';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  // State
  const [query, setQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [hasFreeTrial, setHasFreeTrial] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(true);

  // Debounced query untuk API call
  const debouncedQuery = useDebounce(query, 300);

  // Sync URL changes to state
  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (queryParam !== query) {
      setQuery(queryParam);
    }
  }, [queryParam]);

  // API hooks - gunakan debounced query
  const { data: websites, isLoading: websitesLoading, error } = useWebsites({
    search: debouncedQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    hasFreeTrial: hasFreeTrial || undefined,
    sortBy,
    status: 'active',
  });

  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Client-side filtering (tanpa useMemo yang berat)
  const filteredWebsites = useMemo(() => {
    if (!websites) return [];
    
    let results = [...websites];

    // Filter by search query
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      results = results.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.shortDescription.toLowerCase().includes(q) ||
          w.category?.name.toLowerCase().includes(q)
      );
    }

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'popular':
          return (b.viewCount || 0) - (a.viewCount || 0);
        default:
          return 0;
      }
    });

    return results;
  }, [websites, debouncedQuery, sortBy]);

  // Update URL
  const updateUrl = useCallback((newQuery: string, newCategory: string) => {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newCategory && newCategory !== 'all') params.set('category', newCategory);
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    router.replace(newUrl, { scroll: false });
  }, [router]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    updateUrl(newQuery, selectedCategory);
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    updateUrl(query, categorySlug);
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setHasFreeTrial(false);
    router.replace('/search', { scroll: false });
  };

  // Get category count
  const getCategoryCount = (categorySlug: string) => {
    if (!websites) return 0;
    if (categorySlug === 'all') return websites.length;
    return websites.filter((w) => w.category?.slug === categorySlug).length;
  };

  const isLoading = websitesLoading || categoriesLoading;
  const hasError = !!error;

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Sticky Sub-Header - Simplified animations */}
      <div className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 mb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Toggle */}
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors">
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>

            {/* Search Bar */}
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search for tools, creative assets, or inspiration..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm font-medium text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Sort Dropdown */}
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
          {/* Sidebar Filters - Simplified without heavy animations */}
          <aside className="w-full lg:w-64 shrink-0 space-y-10">
            {/* Categories Section */}
            <div className="border-b border-gray-100 pb-8">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="font-bold text-gray-900 text-sm tracking-wide">CATEGORIES</h3>
                {isCategoryOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {isCategoryOpen && (
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === 'all' ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
                      {selectedCategory === 'all' && <Check size={12} className="text-white" />}
                    </div>
                    <input
                      type="radio"
                      name="category"
                      className="hidden"
                      checked={selectedCategory === 'all'}
                      onChange={() => handleCategoryChange('all')}
                    />
                    <span className={`text-sm ${selectedCategory === 'all' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>All Categories</span>
                    <span className="ml-auto text-xs text-gray-400">{getCategoryCount('all')}</span>
                  </label>

                  {categoriesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded border border-gray-200 bg-gray-100 animate-pulse" />
                          <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {categories?.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat.slug ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
                            {selectedCategory === cat.slug && <Check size={12} className="text-white" />}
                          </div>
                          <input
                            type="radio"
                            name="category"
                            className="hidden"
                            checked={selectedCategory === cat.slug}
                            onChange={() => handleCategoryChange(cat.slug)}
                          />
                          <span className={`text-sm ${selectedCategory === cat.slug ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{cat.name}</span>
                          <span className="ml-auto text-xs text-gray-400">{getCategoryCount(cat.slug)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

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
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasFreeTrial ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}>
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
                </div>
              )}
            </div>

            <button
              onClick={handleClearFilters}
              className="mt-6 w-full py-2 text-sm text-gray-400 hover:text-gray-900 transition-colors text-center"
            >
              Reset all filters
            </button>
          </aside>

          {/* Results Grid - Simplified */}
          <main className="flex-1 min-w-0">
            {/* Results Count Header */}
            <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h1 className="text-lg font-medium text-gray-900">
                {isLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : hasError ? (
                  <span className="text-red-500">Error loading results</span>
                ) : (
                  <>
                    {filteredWebsites.length} Results
                    {query && <span className="text-gray-500 font-normal ml-1">for "{query}"</span>}
                  </>
                )}
              </h1>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <WebsiteCardSkeleton key={i} />
                ))}
              </div>
            ) : hasError ? (
              <EmptyState
                icon={<EmptySearchIcon />}
                title="Something went wrong"
                description="We couldn't load the search results. Please try again later."
                action={
                  <button
                    className="mt-4 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all shadow-sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                }
              />
            ) : filteredWebsites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredWebsites.map((website) => (
                  <div key={website.id}>
                    <WebsiteCard website={website} />
                  </div>
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
                    onClick={handleClearFilters}
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
    <div className="pt-24">
      <Suspense fallback={
        <div className="container mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-64 shrink-0 space-y-10">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border border-gray-200 bg-gray-100 animate-pulse" />
                    <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <WebsiteCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
