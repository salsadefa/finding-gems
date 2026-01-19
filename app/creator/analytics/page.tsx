'use client';

import { useState } from 'react';
import { mockWebsites } from '@/lib/mockData';
import { Eye, ExternalLink, MousePointer2, Heart, ChevronDown } from 'lucide-react';
import Image from 'next/image';

export default function CreatorAnalyticsPage() {
    const creatorWebsites = mockWebsites.filter(w => w.creatorId === 'user-2'); // Mock user
    const [selectedWebsiteId, setSelectedWebsiteId] = useState(creatorWebsites[0]?.id || '');
    const [dateRange, setDateRange] = useState('Last 30 Days');

    const selectedWebsite = creatorWebsites.find(w => w.id === selectedWebsiteId) || creatorWebsites[0];

    // Mock aggregated data if no website selected, otherwise individual data (mocked)
    const stats = {
        views: selectedWebsite ? selectedWebsite.viewCount : 45200,
        clicks: selectedWebsite ? selectedWebsite.clickCount : 12400,
        ctr: '27.4%',
        saves: 890
    };

    // Trend data (mock)
    const trendData = [
        { label: 'Mon', views: 400, clicks: 120 },
        { label: 'Tue', views: 300, clicks: 140 },
        { label: 'Wed', views: 550, clicks: 180 },
        { label: 'Thu', views: 480, clicks: 160 },
        { label: 'Fri', views: 600, clicks: 220 },
        { label: 'Sat', views: 350, clicks: 90 },
        { label: 'Sun', views: 420, clicks: 110 },
    ];

    const maxViews = Math.max(...trendData.map(d => d.views));

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">

            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">

                {/* Product Selector */}
                <div className="relative w-full sm:w-64">
                    <select
                        value={selectedWebsiteId}
                        onChange={(e) => setSelectedWebsiteId(e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                    >
                        {creatorWebsites.map(site => (
                            <option key={site.id} value={site.id}>{site.name}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {selectedWebsite?.thumbnail && !selectedWebsite.thumbnail.includes('placeholder') ? (
                            <div className="w-5 h-5 rounded overflow-hidden relative">
                                <Image src={selectedWebsite.thumbnail} fill className="object-cover" alt="" />
                            </div>
                        ) : (
                            <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                {selectedWebsite?.name.charAt(0)}
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
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Year to Date</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Views */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start justify-between min-h-[140px]">
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-500 mb-4">
                        <Eye size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.views.toLocaleString()}</div>
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
                        <div className="text-2xl font-bold text-gray-900">{stats.clicks.toLocaleString()}</div>
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

                {/* Saves/Bookmarks */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start justify-between min-h-[140px]">
                    <div className="p-3 bg-pink-50 rounded-lg text-pink-600 mb-4">
                        <Heart size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.saves}</div>
                        <div className="text-sm font-medium text-gray-500 mt-1">Bookmarks</div>
                    </div>
                </div>
            </div>

            {/* Main Chart Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
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
                    {trendData.map((data, index) => (
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
                                    {/* Clicks Bar (Dark Blue) - Absolute at bottom of Views bar to overlay or stack */}
                                    {/* Stacked visualization: Clicks is distinct. Let's make it overlay at the bottom. */}
                                    <div
                                        className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-sm transition-all duration-500 group-hover:bg-blue-700"
                                        style={{ height: `${(data.clicks / data.views) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            {/* X Axis Label */}
                            <span className="text-xs text-gray-400 font-medium">{data.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
