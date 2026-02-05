'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebsite } from '@/lib/api/websites';
import { useWebsiteReviews } from '@/lib/api/reviews';
import { useWebsitePricing, useCheckAccess, formatPrice } from '@/lib/api/billing';
import { useAuth, useBookmarks, useToast } from '@/lib/store';
import { formatDate, getInitials } from '@/lib/utils';
import Rating from '@/components/Rating';
import Button from '@/components/Button';
import { ProductDetailSkeleton } from '@/components/Skeleton';
import { Heart, Globe, Check, ChevronDown, ChevronUp, Share2, ShieldCheck, Star, ExternalLink, ArrowUpRight, ShoppingCart, Clock, Sparkles } from 'lucide-react';
import { fadeInUp, staggerContainer, fadeIn, scaleIn } from '@/lib/animations';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function WebsiteDetailPage({ params }: PageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { showToast } = useToast();
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const { data: website, isLoading: isLoadingWebsite, error: websiteError } = useWebsite(slug);
    const { data: websiteReviews = [], isLoading: isLoadingReviews } = useWebsiteReviews(website?.id || '', {
        sortBy: 'newest',
        limit: 10,
    });

    // Get pricing tiers and access status
    const { data: pricingTiers } = useWebsitePricing(website?.id || '');
    const { data: accessStatus } = useCheckAccess(website?.id || '');

    // Loading state
    if (isLoadingWebsite) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-white pt-24"
            >
                <div className="max-w-6xl mx-auto px-4 lg:px-6">
                    <ProductDetailSkeleton />
                </div>
            </motion.div>
        );
    }

    // Error state
    if (websiteError || !website) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-screen flex flex-col items-center justify-center bg-white"
            >
                <motion.h1 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-gray-900 mb-4"
                >
                    {websiteError ? 'Error loading website' : 'Website not found'}
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-600 mb-6"
                >
                    {websiteError ? 'Please try again later.' : 'The website you are looking for does not exist.'}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Link 
                        href="/" 
                        className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
                    >
                        Return Home
                    </Link>
                </motion.div>
            </motion.div>
        );
    }

    const bookmarked = isBookmarked(website.id);

    // Fallback for screenshots if empty (mimicking the "mock logic" request)
    const galleryImages = website.screenshots && website.screenshots.length > 0
        ? website.screenshots
        : [website.thumbnail, website.thumbnail, website.thumbnail];

    const handleBookmark = () => {
        if (!isAuthenticated) { router.push('/login'); return; }
        toggleBookmark(website);
        showToast(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks', 'success');
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-white pb-24"
        >
            {/* Global Container */}
            <div className="max-w-6xl mx-auto px-4 lg:px-6 pt-24">

                {/* SECTION 1: COMPACT HEADER */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col md:flex-row gap-6 mb-8"
                >
                    {/* Logo/Icon */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className="flex-shrink-0"
                    >
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm relative">
                            {website.thumbnail && !website.thumbnail.includes('placeholder') ? (
                                <Image
                                    src={website.thumbnail}
                                    alt={website.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                    {website.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Header Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-2"
                        >
                            {website.name}
                        </motion.h1>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4"
                        >
                            <Link 
                                href={`/search?category=${website.category?.slug}`} 
                                className="text-blue-600 hover:underline font-medium transition-colors"
                            >
                                {website.category?.name}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-gray-900">{website.rating}</span>
                                <Star size={14} className="fill-current text-gray-900" />
                            </div>
                            <span className="text-gray-400">({website.reviewCount} reviews)</span>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1">
                                <span>By</span>
                                <Link 
                                    href={`/profile/${website.creator?.username || 'unknown'}`} 
                                    className="font-medium text-blue-600 hover:underline cursor-pointer transition-colors"
                                >
                                    {website.creator?.name}
                                </Link>
                                {website.creatorProfile?.isVerified && (
                                    <ShieldCheck size={14} className="text-blue-500" />
                                )}
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex items-center gap-3"
                        >
                            <motion.a
                                href={website.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all shadow-sm"
                            >
                                Visit Website <ExternalLink size={18} />
                            </motion.a>
                            <motion.button
                                onClick={handleBookmark}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-3 rounded-full border transition-all ${bookmarked ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                aria-label="Bookmark"
                            >
                                <Heart size={22} fill={bookmarked ? "currentColor" : "none"} />
                            </motion.button>
                            <motion.button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    showToast('Link copied to clipboard', 'success');
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-3 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                                aria-label="Share"
                            >
                                <Share2 size={22} />
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* SECTION 2: SCREENSHOT GALLERY */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-12"
                >
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="flex overflow-x-auto gap-4 pb-6 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                    >
                        {galleryImages.map((img, idx) => (
                            <motion.div 
                                key={idx} 
                                variants={fadeInUp}
                                whileHover={{ scale: 1.02, y: -5 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                className="flex-shrink-0 snap-center relative w-[300px] aspect-[16/9] md:w-[500px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm cursor-pointer group"
                            >
                                {img && !img.includes('placeholder') ? (
                                    <Image
                                        src={img}
                                        alt={`Screenshot ${idx + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <span className="text-4xl font-bold opacity-20">Preview {idx + 1}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* SECTION 3: CONTENT BODY */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT COLUMN: About & Reviews */}
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-2 space-y-12"
                    >

                        {/* About This Tool */}
                        <motion.section variants={fadeInUp}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">About this tool</h2>
                                <ArrowUpRight size={20} className="text-gray-400" />
                            </div>
                            <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line mb-6">
                                {website.description}
                            </p>

                            {/* Short Features List */}
                            <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-wrap gap-2 mb-6"
                            >
                                {website.useCases?.slice(0, 3).map((uc, i) => (
                                    <motion.span 
                                        key={i} 
                                        variants={fadeInUp}
                                        whileHover={{ scale: 1.05 }}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium cursor-default"
                                    >
                                        {uc}
                                    </motion.span>
                                ))}
                            </motion.div>
                        </motion.section>

                        {/* Reviews Preview (Simplified) */}
                        <motion.section variants={fadeInUp}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Ratings and reviews</h2>
                                <motion.button 
                                    whileHover={{ x: 4 }}
                                    className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                                >
                                    See all <ArrowUpRight size={16} />
                                </motion.button>
                            </div>

                            <div className="flex items-center gap-8 mb-8">
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="text-center"
                                >
                                    <div className="text-5xl font-bold text-gray-900">{website.rating}</div>
                                    <Rating value={website.rating} size="sm" />
                                    <div className="text-xs text-gray-500 mt-1">{website.reviewCount} total</div>
                                </motion.div>
                                <div className="flex-1 space-y-1 hidden sm:block">
                                    {[5, 4, 3, 2, 1].map((stars, idx) => (
                                        <motion.div 
                                            key={stars} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.1 * idx }}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            <span className="w-3 text-right font-medium text-gray-600">{stars}</span>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: stars === 5 ? '70%' : stars === 4 ? '20%' : '5%' }}
                                                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                                                    className="h-full bg-blue-600 rounded-full"
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6"
                            >
                                {isLoadingReviews ? (
                                    <>
                                        {[1, 2].map((_, i) => (
                                            <motion.div 
                                                key={i} 
                                                variants={fadeInUp}
                                                className="space-y-2 animate-pulse"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-4 bg-gray-200 rounded" />
                                                    <div className="w-16 h-3 bg-gray-200 rounded" />
                                                </div>
                                                <div className="w-32 h-3 bg-gray-200 rounded" />
                                                <div className="w-full h-16 bg-gray-200 rounded" />
                                            </motion.div>
                                        ))}
                                    </>
                                ) : (
                                    websiteReviews.slice(0, 2).map((review) => (
                                        <motion.div 
                                            key={review.id} 
                                            variants={fadeInUp}
                                            whileHover={{ x: 4 }}
                                            className="space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-default"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-gray-900">{review.user.name}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                                            </div>
                                            <Rating value={review.rating} size="sm" />
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {review.content}
                                            </p>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        </motion.section>
                    </motion.div>

                    {/* RIGHT COLUMN: Pricing & App Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="space-y-8"
                    >

                        {/* Pricing Section */}
                        <AnimatePresence>
                            {pricingTiers && pricingTiers.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-blue-500" />
                                        Get Access
                                    </h3>
                                    
                                    {accessStatus?.has_access ? (
                                        <motion.div 
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="bg-green-100 rounded-lg p-4 mb-4"
                                        >
                                            <div className="flex items-center gap-2 text-green-700">
                                                <Check className="w-5 h-5" />
                                                <span className="font-semibold">You have access!</span>
                                            </div>
                                            {accessStatus.access?.expires_at && (
                                                <p className="text-sm text-green-600 mt-1">
                                                    <Clock className="w-4 h-4 inline mr-1" />
                                                    Expires {formatDate(accessStatus.access.expires_at)}
                                                </p>
                                            )}
                                            <motion.a
                                                href={website.externalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="mt-3 inline-block w-full"
                                            >
                                                <Button className="w-full">
                                                    Access Product <ExternalLink className="w-4 h-4 ml-2" />
                                                </Button>
                                            </motion.a>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            variants={staggerContainer}
                                            initial="hidden"
                                            animate="visible"
                                            className="space-y-3"
                                        >
                                            {pricingTiers.map((tier: { id: string; name: string; description?: string; price: number; duration_days?: number; features?: string[] }, idx: number) => (
                                                <motion.div 
                                                    key={tier.id} 
                                                    variants={fadeInUp}
                                                    whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                                                            {tier.description && (
                                                                <p className="text-sm text-gray-500">{tier.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-lg text-gray-900">
                                                                {formatPrice(tier.price)}
                                                            </p>
                                                            {tier.duration_days ? (
                                                                <p className="text-xs text-gray-500">{tier.duration_days} days</p>
                                                            ) : (
                                                                <p className="text-xs text-green-600">Lifetime</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {tier.features && tier.features.length > 0 && (
                                                        <ul className="mt-2 space-y-1">
                                                            {tier.features.slice(0, 3).map((feature: string, idx: number) => (
                                                                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Check className="w-3 h-3 text-green-500" />
                                                                    {feature}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    <Link href={`/checkout?website=${website.id}&tier=${tier.id}`}>
                                                        <motion.div
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <Button className="w-full mt-3" size="sm">
                                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                                Buy Now
                                                            </Button>
                                                        </motion.div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                        >
                            <h3 className="text-base font-bold text-gray-900 mb-4">Tech Stack</h3>
                            <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-wrap gap-2"
                            >
                                {website.techStack?.map((t, idx) => (
                                    <motion.span 
                                        key={t} 
                                        variants={fadeInUp}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-600 font-medium shadow-sm cursor-default"
                                    >
                                        {t}
                                    </motion.span>
                                ))}
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
                                <span>Data safety</span>
                                <ShieldCheck size={18} className="text-gray-400" />
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                Safety starts with understanding how developers collect and share your data. Data privacy and security practices may vary based on your use, region, and age.
                            </p>
                            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5"><Share2 size={16} className="text-gray-400" /></div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">No data shared with third parties</div>
                                        <div className="text-xs text-gray-500">The developer says this app doesn't share user data with other companies or organizations.</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>

            </div>
        </motion.div>
    );
}
