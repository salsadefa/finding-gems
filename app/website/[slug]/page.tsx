'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { mockWebsites, mockReviews } from '@/lib/mockData';
import { useAuth, useBookmarks, useToast } from '@/lib/store';
import { formatDate, getInitials } from '@/lib/utils';
import Rating from '@/components/Rating';
import { Heart, Globe, Check, ChevronDown, ChevronUp, Share2, ShieldCheck, Star, ExternalLink, ArrowUpRight } from 'lucide-react';

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

    const website = mockWebsites.find((w) => w.slug === slug);

    if (!website) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Website not found</h1>
                <Link href="/" className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
                    Return Home
                </Link>
            </div>
        );
    }

    const websiteReviews = mockReviews.filter((r) => r.websiteId === website.id);
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
        <div className="min-h-screen bg-white pb-24">
            {/* Global Container */}
            <div className="max-w-6xl mx-auto px-4 lg:px-6 pt-24">

                {/* SECTION 1: COMPACT HEADER */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    {/* Logo/Icon */}
                    <div className="flex-shrink-0">
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
                    </div>

                    {/* Header Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
                            {website.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                            <Link href={`/search?category=${website.category.slug}`} className="text-blue-600 hover:underline font-medium">
                                {website.category.name}
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
                                <Link href={`/profile/${website.creator.username || 'unknown'}`} className="font-medium text-blue-600 hover:underline cursor-pointer">
                                    {website.creator.name}
                                </Link>
                                {website.creatorProfile.isVerified && (
                                    <ShieldCheck size={14} className="text-blue-500" />
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <a
                                href={website.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all shadow-sm hover:shadow active:scale-95"
                            >
                                Visit Website <ExternalLink size={18} />
                            </a>
                            <button
                                onClick={handleBookmark}
                                className={`p-3 rounded-full border transition-all ${bookmarked ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                aria-label="Bookmark"
                            >
                                <Heart size={22} fill={bookmarked ? "currentColor" : "none"} />
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    showToast('Link copied to clipboard', 'success');
                                }}
                                className="p-3 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                                aria-label="Share"
                            >
                                <Share2 size={22} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: SCREENSHOT GALLERY */}
                <div className="mb-12">
                    <div className="flex overflow-x-auto gap-4 pb-6 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {galleryImages.map((img, idx) => (
                            <div key={idx} className="flex-shrink-0 snap-center relative w-[300px] aspect-[16/9] md:w-[500px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                                {img && !img.includes('placeholder') ? (
                                    <Image
                                        src={img}
                                        alt={`Screenshot ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <span className="text-4xl font-bold opacity-20">Preview {idx + 1}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION 3: CONTENT BODY */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT COLUMN: About & Reviews */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* About This Tool */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">About this tool</h2>
                                <ArrowUpRight size={20} className="text-gray-400" />
                            </div>
                            <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line mb-6">
                                {website.description}
                            </p>

                            {/* Short Features List */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {website.useCases.slice(0, 3).map((uc, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium">
                                        {uc}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Reviews Preview (Simplified) */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Ratings and reviews</h2>
                                <button className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                                    See all <ArrowUpRight size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-8 mb-8">
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-gray-900">{website.rating}</div>
                                    <Rating value={website.rating} size="sm" />
                                    <div className="text-xs text-gray-500 mt-1">{website.reviewCount} total</div>
                                </div>
                                <div className="flex-1 space-y-1 hidden sm:block">
                                    {[5, 4, 3, 2, 1].map((stars) => (
                                        <div key={stars} className="flex items-center gap-2 text-xs">
                                            <span className="w-3 text-right font-medium text-gray-600">{stars}</span>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    style={{ width: stars === 5 ? '70%' : stars === 4 ? '20%' : '5%' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {websiteReviews.slice(0, 2).map((review) => (
                                    <div key={review.id} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-gray-900">{review.user.name}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                                        </div>
                                        <Rating value={review.rating} size="sm" />
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {review.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: App Info / Tech Stack */}
                    <div className="space-y-8">

                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 mb-4">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {website.techStack.map((t) => (
                                    <span key={t} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-600 font-medium shadow-sm">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
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
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
