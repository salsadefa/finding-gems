'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import WebsiteCard from '@/components/WebsiteCard';
import { WebsiteCardSkeleton } from '@/components/Skeleton';
import { useWebsites } from '@/lib/api/websites';
import { useCategories } from '@/lib/api/categories';
import type { Website } from '@/lib/types';

type SortOption = 'newest' | 'rating' | 'alphabetical';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

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

export default function HomePage() {
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  
  // Fetch real data from API
  const { data: websites, isLoading: websitesLoading, error: websitesError } = useWebsites();
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();

  // Sort websites
  const sortedWebsites = websites?.toSorted((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating': return b.rating - a.rating;
      case 'alphabetical': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-white selection:bg-gray-900 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-gray-900 isolation-auto">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg-hero.png"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
            quality={100}
            unoptimized
          />
          {/* Subtle Gradient Overlay for text readability without darkening everything */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-medium text-white mb-8 shadow-lg shadow-blue-900/20">
              <Sparkles size={12} className="text-yellow-300" aria-hidden="true" />
              <span>Curated for Quality</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight !text-white mb-6 leading-[1.1] drop-shadow-md">
              The Internet&apos;s Best Tools. <br />
              <span className="text-white">
                Hand-Picked.
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              We filter the noise so you don&apos;t have to. Explore a directory of verified, high-quality websites designed to upgrade how you work.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full relative z-20">
              <SearchBar />
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={fadeInUp} className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-8 md:gap-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
              {['Stripe', 'Vercel', 'Linear', 'Notion'].map((brand) => (
                <span key={brand} className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">{brand}</span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 border-t border-gray-50">
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

          {categoriesLoading ? (
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
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {categories?.map((category) => (
                <motion.a
                  key={category.id}
                  href={`/search?category=${category.slug}`}
                  variants={fadeInUp}
                  className="group p-6 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-300"
                >
                  <div className="text-2xl mb-3">{category.icon || '📁'}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-400">Explore tools</p>
                </motion.a>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Listings</h2>
              <p className="text-gray-500 mt-2">Hand-picked by our team.</p>
            </div>
            
            {/* Sort Dropdown */}
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

          {websitesLoading ? (
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
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedWebsites?.slice(0, 6).map((website) => (
                <WebsiteCard 
                  key={website.id} 
                  website={transformWebsite(website)} 
                />
              ))}
            </motion.div>
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
    </div>
  );
}
