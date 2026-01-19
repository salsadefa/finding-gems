'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Zap, Shield, Sparkles, Star } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import WebsiteCard from '@/components/WebsiteCard';
import { WebsiteCardSkeleton } from '@/components/Skeleton';
import { mockWebsites, mockCategories } from '@/lib/mockData';

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

export default function HomePage() {
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [loading] = useState(false);

  const sortedWebsites = [...mockWebsites].sort((a, b) => {
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
      <section className="relative pt-32 pb-24 overflow-visible">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-gray-50 to-white rounded-full blur-3xl opacity-60" />
        </div>

        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 mb-8">
              <Sparkles size={12} className="text-yellow-500" />
              <span>Curated for Quality</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              The Internet’s Best Tools. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
                Hand-Picked.
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              We filter the noise so you don't have to. Explore a directory of verified, high-quality websites designed to upgrade how you work.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full relative z-20">
              <SearchBar />
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={fadeInUp} className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {['Stripe', 'Vercel', 'Linear', 'Notion'].map((brand) => (
                <span key={brand} className="text-sm font-semibold text-gray-400">{brand}</span>
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
            <Link href="/search" className="text-sm font-medium text-gray-900 flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockCategories.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/search?category=${category.slug}`} className="group block p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4 text-gray-900 group-hover:scale-110 transition-transform">
                    {/* Dynamic Icon based on slug/name */}
                    {category.slug === 'productivity' && <Zap size={20} />}
                    {category.slug === 'finance' && <TrendingUp size={20} />}
                    {category.slug === 'security' && <Shield size={20} />}
                    {/* Fallback */}
                    {['productivity', 'finance', 'security'].indexOf(category.slug) === -1 && <Star size={20} />}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.websiteCount} tools</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Featured Websites</h2>
              <p className="text-gray-500 max-w-xl">
                Hand-picked tools that are gaining traction. Verified by our team for quality and utility.
              </p>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
              {(['rating', 'newest', 'alphabetical'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === option
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <WebsiteCardSkeleton key={i} />)
            ) : (
              sortedWebsites.map((website, idx) => (
                <motion.div
                  key={website.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <WebsiteCard website={website} />
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-16 text-center">
            <Link href="/search" className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 rounded-full text-gray-900 font-medium hover:border-gray-900 hover:shadow-lg transition-all group">
              View All Listings
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="relative max-w-5xl mx-auto bg-gray-900 rounded-[2rem] p-12 md:p-24 text-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Built something amazing?
              </h2>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Join our curated directory of creators. Increase your visibility and drive traffic directly to your product.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup?role=creator" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:scale-105 transform duration-200">
                  Submit Your Tool
                </Link>
                <Link href="/creator/benefits" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-gray-700 text-white rounded-full font-medium hover:bg-white/10 transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
