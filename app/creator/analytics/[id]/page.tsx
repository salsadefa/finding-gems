'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    Calendar,
    Download,
    ExternalLink,
    Eye,
    Globe,
    Info,
    MousePointer2,
    TrendingUp,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useWebsiteAnalytics } from '@/lib/api/analytics';
import { useState } from 'react';

export default function ListingAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [dateRange, setDateRange] = useState('Last 30 Days');

    const { data, isLoading, error } = useWebsiteAnalytics(id);
    const website = data?.website;
    const analytics = data?.analytics;

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Loading analytics...</p>
            </div>
        );
    }

    if (error || !website) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h2>
                <p className="text-gray-500 mb-6">The listing you are looking for does not exist or has been removed.</p>
                <Link href="/creator">
                    <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        Return to Dashboard
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/creator" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative flex-shrink-0">
                                    {website.thumbnail && !website.thumbnail.includes('placeholder') ? (
                                        <Image src={website.thumbnail} fill className="object-cover" alt={website.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                            {website.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">{website.name} Analytics</h1>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <span className={`w-2 h-2 rounded-full ${website.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        {website.status === 'active' ? 'Live on Directory' : website.status}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Date Range Dropdown (Mock) */}
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                                    <Calendar size={16} className="text-gray-500" />
                                    {dateRange}
                                </button>
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 z-50">
                                    {['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Year to Date'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setDateRange(r)}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${dateRange === r ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Export Data">
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Views */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Views</p>
                                <h3 className="text-3xl font-bold text-gray-900">{analytics?.totalViews?.toLocaleString() || '0'}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Eye size={24} />
                            </div>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-gray-400">All time views</span>
                        </div>
                    </div>

                    {/* Unique Visitors */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Unique Visitors</p>
                                <h3 className="text-3xl font-bold text-gray-900">{analytics?.uniqueVisitors?.toLocaleString() || '0'}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <Globe size={24} />
                            </div>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-gray-400">Estimated unique</span>
                        </div>
                    </div>

                    {/* Outbound Clicks */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group ring-2 ring-blue-500/10 hover:ring-blue-500 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-1">Outbound Clicks</p>
                                <h3 className="text-3xl font-bold text-gray-900">{analytics?.outboundClicks?.toLocaleString() || '0'}</h3>
                            </div>
                            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                                <ExternalLink size={24} />
                            </div>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-gray-400">Click-throughs to your site</span>
                        </div>
                    </div>

                    {/* CTR */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                    Click-Through Rate <Info size={12} className="text-gray-300" />
                                </p>
                                <h3 className="text-3xl font-bold text-gray-900">{analytics?.ctr || '0.0%'}</h3>
                            </div>
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                                <MousePointer2 size={24} />
                            </div>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-gray-400">Clicks ÷ Views</span>
                        </div>
                    </div>
                </div>

                {/* Main Visual: Traffic Analysis */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Traffic Analysis</h3>
                            <p className="text-sm text-gray-500">Views vs Outbound Clicks trend</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-100"></span> Views
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-600"></span> Clicks
                            </div>
                        </div>
                    </div>

                    {/* Custom CSS Bar Chart */}
                    <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
                        {(analytics?.history || []).map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                    Day {i + 1}: {Math.round((analytics?.totalViews || 0) * (val / 100))} views
                                </div>

                                {/* Bars */}
                                <div className="w-full bg-blue-100 rounded-t-sm relative transition-all group-hover:bg-blue-200" style={{ height: `${val}%` }}>
                                    <div className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-sm transition-all group-hover:bg-blue-700" style={{ height: `${val * 0.35}%` }}></div>
                                </div>

                                {/* Label */}
                                <div className="mt-2 text-[10px] text-gray-400 text-center">{i + 1}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-hidden">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-sm font-medium text-gray-700">Rating</span>
                                <span className="text-sm font-bold text-gray-900">⭐ {website.rating?.toFixed(1) || '0.0'} ({website.reviewCount || 0} reviews)</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-sm font-medium text-gray-700">Listed Since</span>
                                <span className="text-sm font-bold text-gray-900">{new Date(website.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Boost your reach</h3>
                            <p className="text-blue-100 mb-8 max-w-sm">Get more visibility for your listing by being featured in our weekly newsletter.</p>

                            <button className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                Promote Listing
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
