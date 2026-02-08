'use client';

import { useState } from 'react';
import { useAnalyticsOverview, formatNumber, formatCurrency } from '@/lib/api/analytics';
import { Eye, ExternalLink, MousePointer2, Heart, ChevronDown, TrendingUp, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function CreatorAnalyticsPage() {
    const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('all');
    const [dateRange, setDateRange] = useState<'7d' | '30d' | 'ytd'>('30d');

    const { data, isLoading, error } = useAnalyticsOverview(dateRange);

    // Get selected website data or aggregated
    const selectedWebsite = selectedWebsiteId !== 'all' 
        ? data?.websites.find(w => w.id === selectedWebsiteId) 
        : null;

    // Calculate stats based on selection
    const stats = selectedWebsite 
        ? {
            views: selectedWebsite.viewCount,
            clicks: selectedWebsite.clickCount,
            ctr: selectedWebsite.viewCount > 0 
                ? `${((selectedWebsite.clickCount / selectedWebsite.viewCount) * 100).toFixed(1)}%` 
                : '0%',
            saves: selectedWebsite.bookmarkCount,
            rating: selectedWebsite.rating,
        }
        : {
            views: data?.stats.totalViews || 0,
            clicks: data?.stats.totalClicks || 0,
            ctr: `${data?.stats.ctr || 0}%`,
            saves: data?.stats.totalBookmarks || 0,
            rating: data?.stats.averageRating || 0,
        };

    // Filter trend data for selected website or use aggregate
    const trendData = data?.trend || [];
    const maxViews = Math.max(...trendData.map(d => d.views), 1);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading analytics...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load analytics</h2>
                        <p className="text-gray-600">Please try again later or contact support.</p>
                    </div>
                </div>
            </div>
        );
    }

    const websites = data?.websites || [];

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Track your website performance and engagement</p>
            </div>

            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">

                {/* Product Selector */}
                <div className="relative w-full sm:w-64">
                    <select
                        value={selectedWebsiteId}
                        onChange={(e) => setSelectedWebsiteId(e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="all">All Products ({websites.length})</option>
                        {websites.map(site => (
                            <option key={site.id} value={site.id}>{site.name}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {selectedWebsite?.thumbnail && !selectedWebsite.thumbnail.includes('placeholder') ? (
                            <div className="w-5 h-5 rounded overflow-hidden relative">
                                <Image src={selectedWebsite.thumbnail} fill className="object-cover" alt="" />
                            </div>
                        ) : (
                            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                                {selectedWebsiteId === 'all' ? '∑' : selectedWebsite?.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown size={16} />
                    </div>
                </div>

                {/* Date Range */}
                <div className="relative w-full sm:w-auto">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | 'ytd')}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="ytd">Year to Date</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {websites.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No websites yet</h3>
                    <p className="text-gray-600 mb-6">Create your first website listing to start tracking analytics.</p>
                    <a
                        href="/creator/listings/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Create Website
                    </a>
                </div>
            ) : (
                <>
                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Views */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start justify-between min-h-[140px]">
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-500 mb-4">
                                <Eye size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.views)}</div>
                                <div className="text-sm font-medium text-gray-500 mt-1">Total Views</div>
                            </div>
                        </div>

                        {/* Outbound Clicks (Highlighted) */}
                        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col items-start justify-between min-h-[140px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600 mb-4 z-10">
                                <ExternalLink size={24} />
                            </div>
                            <div className="z-10">
                                <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.clicks)}</div>
                                <div className="text-sm font-bold text-blue-600 mt-1">Outbound Clicks</div>
                            </div>
                        </div>

                        {/* CTR */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start justify-between min-h-[140px]">
                            <div className="p-3 bg-purple-50 rounded-lg text-purple-600 mb-4">
                                <MousePointer2 size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{stats.ctr}</div>
                                <div className="text-sm font-medium text-gray-500 mt-1">Click-Through Rate</div>
                            </div>
                        </div>

                        {/* Revenue */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start justify-between min-h-[140px]">
                            <div className="p-3 bg-green-50 rounded-lg text-green-600 mb-4">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(data?.stats.totalRevenue || 0)}
                                </div>
                                <div className="text-sm font-medium text-gray-500 mt-1">
                                    {data?.stats.totalSales || 0} Sales
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Chart Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-gray-900">Traffic Analysis</h3>
                            <div className="flex items-center gap-4 text-xs font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-100"></span>
                                    <span className="text-gray-600">Views</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                                    <span className="text-gray-600">Clicks</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 md:h-80 w-full flex items-end justify-between gap-4 px-2">
                            {trendData.slice(-7).map((data, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                    {/* Bars Container */}
                                    <div className="w-full max-w-[40px] flex flex-col justify-end relative h-full">
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap pointer-events-none">
                                            {data.views} Views, {data.clicks} Clicks
                                        </div>

                                        {/* Views Bar (Light Blue) */}
                                        <div
                                            className="w-full bg-blue-100 rounded-t-sm transition-all duration-500 group-hover:bg-blue-200 relative"
                                            style={{ height: `${(data.views / maxViews) * 100}%` }}
                                        >
                                            {/* Clicks Bar (Dark Blue) */}
                                            <div
                                                className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-sm transition-all duration-500 group-hover:bg-blue-700"
                                                style={{ height: data.views > 0 ? `${(data.clicks / data.views) * 100}%` : '0%' }}
                                            ></div>
                                        </div>
                                    </div>
                                    {/* X Axis Label */}
                                    <span className="text-xs text-gray-400 font-medium">{data.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Website Performance Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Website Performance</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {websites.map(website => {
                                        const ctr = website.viewCount > 0 
                                            ? ((website.clickCount / website.viewCount) * 100).toFixed(1) 
                                            : '0';
                                        return (
                                            <tr key={website.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                                                            {website.thumbnail ? (
                                                                <Image
                                                                    src={website.thumbnail}
                                                                    alt={website.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                                                    {website.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{website.name}</p>
                                                            <p className="text-xs text-gray-500">/{website.slug}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                    {formatNumber(website.viewCount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                    {formatNumber(website.clickCount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                    {ctr}%
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                    {website.rating > 0 ? `${website.rating.toFixed(1)} ★` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        website.status === 'active' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : website.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {website.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
