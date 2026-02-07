'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import WebsiteCard from '@/components/WebsiteCard';
import { WebsiteCardSkeleton } from '@/components/Skeleton';
import { useWebsites } from '@/lib/api/websites';
import { useCategories } from '@/lib/api/categories';
import type { Website } from '@/lib/types';
import { ArrowRight, Sparkles } from 'lucide-react';

type SortOption = 'newest' | 'rating' | 'alphabetical';

// Simple CSS animation - no JS overhead
const fadeInUpStyle = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
    opacity: 0;
  }
  .animate-delay-100 { animation-delay: 100ms; }
  .animate-delay-200 { animation-delay: 200ms; }
  .animate-delay-300 { animation-delay: 300ms; }
  .animate-delay-400 { animation-delay: 400ms; }
`;

// Transform API website data to match Website type
const transformWebsite = (apiWebsite: any): Website => {
  return {
    id: apiWebsite.id,
    name: apiWebsite.name,
    slug: apiWebsite.slug,
    description: apiWebsite.description || apiWebsite.shortDescription,
    shortDescription: apiWebsite.shortDescription,
    categoryId: apiWebsite.categoryId || '',
    category: apiWebsite.category || {
      id: '',
      name: 'Uncategorized',
      slug: '',
      description: '',
      websiteCount: 0,
      isActive: true,
      createdAt: '',
    },
    creatorId: apiWebsite.creatorId || '',
    creator: apiWebsite.creator || {
      id: '',
      name: 'Unknown',
      username: '',
      email: '',
      role: 'visitor',
      createdAt: '',
    },
    creatorProfile: {
      userId: apiWebsite.creatorId || '',
      bio: '',
      professionalBackground: '',
      expertise: [],
      isVerified: false,
      totalWebsites: 0,
      rating: 0,
      reviewCount: 0,
    },
    thumbnail: apiWebsite.thumbnail,
    screenshots: apiWebsite.screenshots || [],
    externalUrl: apiWebsite.externalUrl || '',
    techStack: apiWebsite.techStack || [],
    useCases: apiWebsite.useCases || [],
    faq: [],
    hasFreeTrial: apiWebsite.hasFreeTrial || false,
    freeTrialDetails: '',
    rating: apiWebsite.rating || 0,
    reviewCount: apiWebsite.reviewCount || 0,
    viewCount: apiWebsite.viewCount || 0,
    clickCount: apiWebsite.clickCount || 0,
    status: apiWebsite.status || 'active',
    createdAt: apiWebsite.createdAt,
    updatedAt: apiWebsite.createdAt,
  };
};

// Lazy load hook using Intersection Observer
function useLazyLoad(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Categories Section Component - Lazy Loaded
function CategoriesSection() {
  const { ref, isVisible } = useLazyLoad();
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();

  return (
    <section ref={ref} className="py-20 border-t border-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Browse by Category</h2>
            <p className="text-gray-500 mt-2">Find exactly what you need.</p>
          </div>
          <Link 
            href="/search" 
            className="text-sm font-medium text-gray-900 hover:text-gray-600 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {!isVisible ? (
          // Placeholder while not visible
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categoriesError ? (
          <div className="text-red-500 text-center py-8">
            Failed to load categories. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((category, index) => (
              <a
                key={category.id}
                href={`/search?category=${category.slug}`}
                className="group p-6 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="text-2xl mb-3">{category.icon || '📁'}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-xs text-gray-400">Explore tools</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Featured Listings Section - Lazy Loaded
function FeaturedSection() {
  const { ref, isVisible } = useLazyLoad();
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const { data: websites, isLoading: websitesLoading, error: websitesError } = useWebsites();

  const sortedWebsites = websites?.toSorted((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating': return b.rating - a.rating;
      case 'alphabetical': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  return (
    <section ref={ref} className="py-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Listings</h2>
            <p className="text-gray-500 mt-2">Hand-picked by our team.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gray-400"
            >
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {!isVisible ? (
          // Placeholder while not visible
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : websitesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <WebsiteCardSkeleton key={i} />
            ))}
          </div>
        ) : websitesError ? (
          <div className="text-red-500 text-center py-8">
            Failed to load websites. Please try again.
          </div>
        ) : sortedWebsites?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No websites found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWebsites?.slice(0, 6).map((website, index) => (
              <div 
                key={website.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <WebsiteCard website={transformWebsite(website)} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link 
            href="/search" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            View All Listings
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white selection:bg-gray-900 selection:text-white">
      <style jsx global>{fadeInUpStyle}</style>
      
      {/* Hero Section - Above the fold, load immediately */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-gray-900 isolation-auto">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg-hero.png"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
            quality={75}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Simple fade-in with CSS */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-medium text-white mb-8 shadow-lg shadow-blue-900/20">
                <Sparkles size={12} className="text-yellow-300" aria-hidden="true" />
                <span>Curated for Quality</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight !text-white mb-6 leading-[1.1] drop-shadow-md animate-fade-in-up animate-delay-100">
              The Internet&apos;s Best Tools. <br />
              <span className="text-white">Hand-Picked.</span>
            </h1>

            <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up animate-delay-200">
              We filter the noise so you don&apos;t have to. Explore a directory of verified, high-quality websites designed to upgrade how you work.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full relative z-20 animate-fade-in-up animate-delay-300">
              <SearchBar />
            </div>

            {/* Trust Badges */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-8 md:gap-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-500 animate-fade-in-up animate-delay-400">
              {['Stripe', 'Vercel', 'Linear', 'Notion'].map((brand) => (
                <span key={brand} className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Below-fold sections - Lazy loaded */}
      <CategoriesSection />
      <FeaturedSection />
    </div>
  );
}
